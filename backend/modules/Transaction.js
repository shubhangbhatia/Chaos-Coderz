const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
        type: String,
        enum: ['Shopping', 'Bills', 'EMI', 'Food', 'Transportation', 'Entertainment', 'Healthcare', 'Education', 'Other'],
        default: 'Other'
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
