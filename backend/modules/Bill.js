const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    dueDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
