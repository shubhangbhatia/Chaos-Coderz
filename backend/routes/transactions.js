const express = require('express');
const router = express.Router();
const Bill = require('../modules/Bill');
const Transaction = require('../modules/Transaction');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.get('/transaction', isLoggedIn, (req, res) => {
    res.render('transaction');
});

router.post('/transaction', isLoggedIn, async (req, res) => {
    try {
        const { transactionName, transactionType, transactionCategory, transactionAmount, transactionDate } = req.body;

        // Date validation: Should not be in the future
        const selectedDate = new Date(transactionDate || Date.now());
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        if (selectedDate > today) {
            console.error('Transaction creation error: Date cannot be in the future');
            return res.redirect('/transaction');
        }

        const newTransaction = new Transaction({
            userId: req.session.user.id,
            name: transactionName,
            type: transactionType,
            category: transactionCategory || 'Other',
            amount: parseFloat(transactionAmount),
            date: transactionDate || Date.now()
        });

        await newTransaction.save();
        res.redirect('/');
    } catch (error) {
        console.error('Transaction creation error:', error);
        res.redirect('/');
    }
});

router.get('/add-bill', isLoggedIn, (req, res) => {
    res.render('bills');
});

router.post('/add-bill', isLoggedIn, async (req, res) => {
    try {
        const { orderName, billAmount, orderStatus, dueDate, isRecurring, recurringInterval, sendEmail } = req.body;

        const newBill = new Bill({
            userId: req.session.user.id,
            name: orderName,
            amount: parseFloat(billAmount),
            status: orderStatus,
            dueDate: dueDate,
            isRecurring: isRecurring === 'on',
            recurringInterval: isRecurring === 'on' ? (recurringInterval || 'none') : 'none'
        });

        await newBill.save();

        // Send confirmation email if requested
        if (sendEmail === 'on') {
            try {
                const User = require('../modules/User');
                const { sendBillCreatedEmail } = require('../utils/emailService');

                const user = await User.findById(req.session.user.id);

                if (user && user.email && user.emailNotifications) {
                    await sendBillCreatedEmail(user.email, {
                        name: newBill.name,
                        amount: newBill.amount,
                        dueDate: newBill.dueDate,
                        status: newBill.status,
                        isRecurring: newBill.isRecurring,
                        recurringInterval: newBill.recurringInterval
                    });

                    // Update email tracking
                    newBill.emailSent = true;
                    newBill.lastEmailSent = new Date();
                    await newBill.save();
                }
            } catch (emailError) {
                console.error('Email sending failed (non-blocking):', emailError.message);
                // Don't block bill creation if email fails
            }
        }

        res.redirect('/');
    } catch (error) {
        console.error('Bill creation error:', error);
        res.redirect('/');
    }
});

module.exports = router;
