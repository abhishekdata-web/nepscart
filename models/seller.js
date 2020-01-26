const mongoose = require('mongoose');

const sellerSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        unique: 1,
        maxlength: 100
    }
})

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = { Seller };