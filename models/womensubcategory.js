const mongoose = require('mongoose');

const womensubcategorySchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        unique: 1,
        maxlength: 100
    }
})

const WomenSubcategory = mongoose.model('WomenSubcategory', womensubcategorySchema);

module.exports = { WomenSubcategory };