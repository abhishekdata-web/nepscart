const mongoose = require('mongoose');

const colorSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        unique: 1,
        maxlength: 100
    }
})

const Color = mongoose.model('Color', colorSchema);

module.exports = { Color };