const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: Array,
        default: []
    },
    data: {
        type: Array,
        default: []
    },
    product: {
        type: Array,
        default: []
    },
    status:{
        type: String,
        default: 'Pending Acceptance'
    }
})

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };