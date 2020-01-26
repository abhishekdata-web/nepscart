const mongoose = require('mongoose');

const subcategorySchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        unique: 1,
        maxlength: 100
    }
})

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = { Subcategory };