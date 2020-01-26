const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');
const upload = require('express-fileupload');
const fs = require('fs');
const SHA1 = require('crypto-js/sha1');

const app = express();
require('dotenv').config();
const async = require('async');

// Mongoose Warning --- remove later
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology: true
})
    .then(() => console.log('mongodb connected'))
    .catch(err => console.log(err));

// Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars');

// static path
app.use(express.static(path.join(__dirname, 'public')));

// File Upload
app.use(upload());

//body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//cookie parser
app.use(cookieParser());

//Models
const { User } = require('./models/user');
const { Category } = require('./models/category');
const { Color } = require('./models/color');
const { Seller } = require('./models/seller');
const { Subcategory } = require('./models/subcategory');
const { Size } = require('./models/size');
const { Product } = require('./models/product');
const { Order } = require('./models/order');

//Middlewares
const { auth } = require('./middleware/auth');

//============================================= api routes ==========================================
//user routes========
app.post('/api/users/register', (req, res) => {
    User.findOne({ 'email': req.body.email })
        .then(user => {
            if (user) {
                return res.json({ registerSuccess: false, message: 'Email already registered' })
            } else {
                const newUser = new User(req.body);

                newUser.save((err, doc) => {
                    if (err) return res.json({ success: false, err });

                    //sendEmail(doc.email, doc.name, null, "welcome");
                    return res.status(200).json({
                        success: true
                    })
                })
            }
        })
})

app.post('/api/users/login', (req, res) => {
    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.json({ loginSuccess: false, message: 'Auth failed, email not found' });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({ loginSuccess: false, message: 'Wrong Password' });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                res.cookie('w_auth', user.token).status(200).json({
                    loginSuccess: true
                })
            })
        })
    })
})

app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        cart: req.user.cart,
        history: req.user.history
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate(
        { _id: req.user._id },
        { token: '' },
        (err, doc) => {
            if (err) return res.json({ success: false, err });

            return res.status(200).send({
                success: true
            })
        }
    )
})

app.post('/api/users/addToCart', auth, (req, res) => {
    User.findOne({ _id: req.user._id }, (err, doc) => {
        let duplicate = false;

        doc.cart.forEach((item) => {
            if (item.id == req.query.productId) {
                duplicate = true;
            }
        });

        if (duplicate) {
            User.findOneAndUpdate(
                { _id: req.user._id, 'cart.id': mongoose.Types.ObjectId(req.query.productId) },
                { $inc: { 'cart.$.quantity': 1 } },
                { new: true },
                () => {
                    if (err) return res.json({ success: false, err });
                    res.status(200).json(doc.cart)
                }
            )
        } else {
            User.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $push: {
                        cart: {
                            id: mongoose.Types.ObjectId(req.query.productId),
                            quantity: 1,
                            date: Date.now()
                        }
                    }
                },
                { new: true },
                (err, doc) => {
                    if (err) return res.json({ success: false, err });
                    res.status(200).json(doc.cart)
                }
            )
        }
    })
})

app.get('/api/users/removeFromCart', auth, (req, res) => {
    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            "$pull":
                { "cart": { "id": mongoose.Types.ObjectId(req.query._id) } }
        },
        { new: true },
        (err, doc) => {
            let cart = doc.cart;
            let array = cart.map(item => {
                return mongoose.Types.ObjectId(item.id)
            })

            Product
                .find({ '_id': { $in: array } })
                .populate('category')
                .populate('subcategory')
                .populate('color')
                .populate('size')
                .populate('seller')
                .exec((err, cartDetail) => {
                    return res.status(200).json({
                        cartDetail,
                        cart
                    })
                })
        }
    )
})

app.post('/api/users/addorder', auth, (req, res) => {
    let history = [];
    let transactionData = {};

    const date = new Date();
    const po = `PO-${date.getTime()}${date.getMilliseconds()}-${SHA1(req.user._id).toString().substring(0, 8)}`

    req.body.cartDetail.forEach(item => {
        history.push({
            porder: po,
            dateOfPurchase: Date.now(),
            name: item.name,
            seller: item.seller.name,
            size: item.size.name,
            id: item._id,
            quantity:
                (item.stock - item.sold) - item.quantity < 0 ?
                    item.stock - item.sold <= 0 ?
                        0
                        :
                        item.stock - item.sold
                    : item.quantity
            , //item.quantity,
            price: item.price
        })
    })

    transactionData.user = {
        id: req.user._id,
        name: req.user.firstname + ' ' + req.user.lastname,
        email: req.user.email
    }
    transactionData.data = {
        ...req.body.dataToSubmit,
        porder: po
    };
    transactionData.product = history

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { history: { $each: history, $position: 0 } }, $set: { cart: [] } },
        { new: true },
        (err, user) => {
            if (err) return res.json({ success: false, err });

            const order = new Order(transactionData);
            order.save((err, doc) => {
                if (err) return res.json({ success: false, err });
                let products = [];
                doc.product.forEach(item => {
                    products.push({
                        id: item.id,
                        quantity: item.quantity
                    })
                })

                async.eachSeries(products, (item, callback) => {
                    Product.update(
                        { _id: item.id },
                        {
                            $inc: {
                                "sold": item.quantity
                            }
                        },
                        { new: false },
                        callback
                    )
                }, (err) => {
                    if (err) return res.json({ success: false, err });

                    res.status(200).json({
                        success: true,
                        order: doc,
                        cart: user.cart,
                        cartDetail: []
                    })
                })
            })
        }
    )
})

// filter routes =======
app.post('/api/product/category', (req, res) => {
    const category = new Category(req.body);

    category.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            category: doc
        })
    })
})

app.get('/api/product/categories', (req, res) => {
    Category.find({}, (err, categories) => {
        if (err) return res.status(400).send(err);

        res.status(200).send(categories);
    })
})

app.post('/api/product/subcategory', (req, res) => {
    const subcategory = new Subcategory(req.body);

    subcategory.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            subcategory: doc
        })
    })
})

app.get('/api/product/subcategories', (req, res) => {
    Subcategory.find({}, (err, subcategories) => {
        if (err) return res.status(400).send(err);

        res.status(200).send(subcategories);
    })
})

app.post('/api/product/color', (req, res) => {
    const color = new Color(req.body);

    color.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            color: doc
        })
    })
})

app.get('/api/product/colors', (req, res) => {
    Color.find({}, (err, colors) => {
        if (err) return res.status(400).send(err);

        res.status(200).send(colors);
    })
})

app.post('/api/product/seller', (req, res) => {
    const seller = new Seller(req.body);

    seller.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            seller: doc
        })
    })
})

app.get('/api/product/sellers', (req, res) => {
    Seller.find({}, (err, sellers) => {
        if (err) return res.status(400).send(err);

        res.status(200).send(sellers);
    })
})

app.post('/api/product/size', (req, res) => {
    const size = new Size(req.body);

    size.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            size: doc
        })
    })
})

app.get('/api/product/sizes', (req, res) => {
    Size.find({}, (err, sizes) => {
        if (err) return res.status(400).send(err);

        res.status(200).send(sizes);
    })
})

//product routes ==============
app.get('/api/product/delete', (req, res) => {
    Product.findOne({ _id: req.query._id })
        .then(product => {
            fs.unlink("./public/productUploads/" + product.file, (err) => {
                fs.unlink("./public/productUploads/" + product.file1, (err) => {
                    fs.unlink("./public/productUploads/" + product.file2, (err) => {
                        fs.unlink("./public/productUploads/" + product.file3, (err) => {
                            fs.unlink("./public/productUploads/" + product.file4, (err) => {
                                product.remove();

                                res.send({ message: "Product deleted successfully!" });
                            })
                        })
                    })
                })
            })
        }).catch(err => console.log(err))
})

app.post('/api/product/article', (req, res) => {
    let file = req.files.file;
    let filename = Date.now() + '-' + file.name;

    file.mv("./public/productUploads/" + filename, (err) => {
        if (err) throw err;
    })
    // ==============
    let file1 = req.files.file1;
    let filename1 = Date.now() + '-' + file1.name;

    file1.mv("./public/productUploads/" + filename1, (err) => {
        if (err) throw err;
    })
    // ==============
    let file2 = req.files.file2;
    let filename2 = Date.now() + '-' + file2.name;

    file2.mv("./public/productUploads/" + filename2, (err) => {
        if (err) throw err;
    })
    // ==============
    let file3 = req.files.file3;
    let filename3 = Date.now() + '-' + file3.name;

    file3.mv("./public/productUploads/" + filename3, (err) => {
        if (err) throw err;
    })
    // ==============
    let file4 = req.files.file4;
    let filename4 = Date.now() + '-' + file4.name;

    file4.mv("./public/productUploads/" + filename4, (err) => {
        if (err) throw err;
    })
    // ==============

    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        cutoffprice: req.body.cutoffprice,
        stock: req.body.stock,
        description: req.body.description,
        category: req.body.category,
        subcategory: req.body.subcategory,
        color: req.body.color,
        size: req.body.size,
        seller: req.body.seller,
        shipping: req.body.shipping,
        available: req.body.available,
        file: filename,
        file1: filename1,
        file2: filename2,
        file3: filename3,
        file4: filename4
    });

    product.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            article: doc
        })
    })
})

app.post('/api/product/shop', (req, res) => {
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    if (req.body.category) {
        if (req.body.category.length > 0) {
            findArgs['category'] = req.body.category;
        }
    }
    if (req.body.subcategory) {
        if (req.body.subcategory.length > 0) {
            findArgs['subcategory'] = req.body.subcategory;
        }
    }
    if (req.body.color) {
        if (req.body.color.length > 0) {
            findArgs['color'] = req.body.color;
        }
    }
    if (req.body.size) {
        if (req.body.size.length > 0) {
            findArgs['size'] = req.body.size;
        }
    }
    if (req.body.seller) {
        if (req.body.seller.length > 0) {
            findArgs['seller'] = req.body.seller;
        }
    }

    findArgs['name'] = { "$regex": req.body.search ? req.body.search : '', "$options": "i" };
    findArgs['available'] = true;

    Product.
        find(findArgs).
        populate('subcategory').
        populate('category').
        populate('color').
        populate('size').
        populate('seller').
        sort([[sortBy, order]]).
        skip(skip).
        limit(limit).
        exec((err, articles) => {
            if (err) return res.status(400).send(err);
            res.status(200).json({
                size: articles.length,
                articles
            })
        })
})

//query string = /api/product/articles_by_id?id=asdasdasd,asdasd&type=array
app.get('/api/product/articles_by_id', (req, res) => {
    let type = req.query.type;
    let items = req.query.id;

    if (type === 'array') {
        let ids = req.query.id.split(',');
        items = [];
        items = ids.map(item => {
            return mongoose.Types.ObjectId(item)
        })
    }

    Product
        .find({ '_id': { $in: items } })
        .populate('category')
        .populate('subcategory')
        .populate('color')
        .populate('size')
        .populate('seller')
        .exec((err, docs) => {
            return res.status(200).send(docs);
        })
})

//============================frontend routes=======================================
app.get('/', (req, res) => {
    res.render('index/index');
})

app.get('/user-login', (req, res) => {
    res.render('index/login');
})

app.get('/shop', (req, res) => {
    res.render('index/shop');
})

app.get('/shop-detail/:_id', (req, res) => {
    res.render('index/shop-detail');
})

//============================frontend auth routes====================================
app.get('/admin/add_product', (req, res) => {
    res.render('admin/add_product');
})

app.get('/cart', (req, res) => {
    res.render('admin/cart');
})

const PORT = 3000;

app.listen(PORT, () => {
    console.log("server started at port 3000");
})