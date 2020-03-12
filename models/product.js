const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        unique: 1
    },
    description: {
        required: true,
        type: String
    },
    price: {
        required: true,
        type: Number
    },
    cutoffprice: {
        required: true,
        type: Number
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true
    },
    womensubcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WomenSubcategory',
        required: true
    },
    color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Color',
        required: true
    },
    size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Size',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    shipping: {
        required: true,
        type: Boolean
    },
    available: {
        required: true,
        type: Boolean
    },
    cod: {
        required: true,
        type: Boolean
    },
    return: {
        required: true,
        type: Boolean
    },
    sold: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number
    },
    file:{
        type: String,
        required: true
    },
    file1:{
        type: String,
        required: true
    },
    file2:{
        type: String,
        required: true
    },
    file3:{
        type: String,
        required: true
    },
    file4:{
        type: String,
        required: true
    },
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema);

module.exports = { Product };