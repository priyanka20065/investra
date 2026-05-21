const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stockName: {
        type: String,
        required: true
    },
    ticker: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['BUY', 'SELL', 'WITHDRAWAL'],
        required: true
    },
    mode: {
        type: String,
        enum: ['REAL', 'DEMO'],
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'CANCELLED', 'FAILED'],
        default: 'COMPLETED'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
