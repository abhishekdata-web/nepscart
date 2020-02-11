const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        unique: 1,
        maxlength: 100
    },
    description: {
        type: String
    },
    file: {
        type: String
    },
    file1: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Blog = mongoose.model('Blog', blogSchema);

module.exports = { Blog };