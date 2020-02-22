const mongoose = require('mongoose');

const accessoriessubcategorySchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        unique: 1,
        maxlength: 100
    }
})

const AccessoriesSubcategory = mongoose.model('AccessoriesSubcategory', accessoriessubcategorySchema);

module.exports = { AccessoriesSubcategory };