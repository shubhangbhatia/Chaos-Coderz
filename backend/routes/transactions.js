const express = require('express');
const router = express.Router();
const Bill = require('../modules/Bill');
const Transaction = require('../modules/Transaction');
const { isLoggedIn } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const transactionValidation = [
    body('transactionName')
        .trim()
        .notEmpty().withMessage('Transaction name is required.')
        .isLength({ min: 3, max: 50 }).withMessage('Transaction name must be 3-50 characters.')
        .escape(),
    body('transactionType')
        .notEmpty().withMessage('Transaction type is required.')
        .isIn(['income', 'expense']).withMessage('Transaction type must be income or expense.'),
    body('transactionCategory')
        .optional({ checkFalsy: true })
        .trim()
        .isIn(['Shopping', 'Bills', 'EMI', 'Food', 'Transportation', 'Entertainment', 'Healthcare', 'Education', 'Other'])
        .withMessage('Invalid transaction category.')
        .escape(),
    body('transactionAmount')
        .notEmpty().withMessage('Amount is required.')
        .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.')
        .toFloat(),
    body('transactionDate')
        .notEmpty().withMessage('Date is required.')
        .isISO8601().withMessage('Please provide a valid date.')
        .toDate()
        .custom((value) => {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (value > today) {
                throw new Error('Date cannot be in the future.');
            }
            return true;
        })
];

const billValidation = [
    body('orderName')
        .trim()
        .notEmpty().withMessage('Bill name is required.')
        .isLength({ min: 3, max: 100 }).withMessage('Bill name must be 3-100 characters.')
        .escape(),
    body('billAmount')
        .notEmpty().withMessage('Bill amount is required.')
        .isFloat({ gt: 0 }).withMessage('Bill amount must be greater than 0.')
        .toFloat(),
    body('orderStatus')
        .notEmpty().withMessage('Bill status is required.')
        .isIn(['pending', 'paid']).withMessage('Status must be pending or paid.'),
    body('dueDate')
        .notEmpty().withMessage('Due date is required.')
        .isISO8601().withMessage('Please provide a valid due date.')
        .toDate(),
    body('isRecurring')
        .optional()
        .toBoolean(),
    body('recurringInterval')
        .optional({ checkFalsy: true })
        .custom((value, { req }) => {
            if (req.body.isRecurring === 'on') {
                if (!['weekly', 'monthly', 'yearly'].includes(value)) {
                    throw new Error('Recurring interval must be weekly, monthly, or yearly.');
                }
            }
            return true;
        })
];

router.get('/transaction', isLoggedIn, (req, res) => {
    res.render('transaction');
});

router.post('/transaction', isLoggedIn, transactionValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('transaction', {
            errors: errors.array(),
            oldInput: req.body
        });
    }

    try {
        const { transactionName, transactionType, transactionCategory, transactionAmount, transactionDate } = req.body;

        const newTransaction = new Transaction({
            userId: req.session.user.id,
            name: transactionName,
            type: transactionType,
            category: transactionCategory || 'Other',
            amount: transactionAmount,
            date: transactionDate || Date.now()
        });

        await newTransaction.save();
        res.redirect('/');
    } catch (error) {
        console.error('Transaction creation error:', error);
        res.status(500).render('transaction', {
            errors: [{ msg: 'An unexpected error occurred while saving the transaction.' }],
            oldInput: req.body
        });
    }
});

router.get('/add-bill', isLoggedIn, (req, res) => {
    res.render('bills');
});

router.post('/add-bill', isLoggedIn, billValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('bills', {
            errors: errors.array(),
            oldInput: req.body
        });
    }

    try {
        const { orderName, billAmount, orderStatus, dueDate, isRecurring, recurringInterval, sendEmail } = req.body;

        const newBill = new Bill({
            userId: req.session.user.id,
            name: orderName,
            amount: billAmount,
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
        res.status(500).render('bills', {
            errors: [{ msg: 'An unexpected error occurred while creating the bill.' }],
            oldInput: req.body
        });
    }
});

module.exports = router;
