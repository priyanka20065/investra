const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
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
    qty: {
        type: Number,
        required: true
    },
    avgPrice: {
        type: Number,
        required: true
    },
    mode: {
        type: String,
        enum: ['REAL', 'DEMO'],
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Holding', holdingSchema);
