const express = require('express');
const router = express.Router();
const Transaction = require('../modules/Transaction');
const Bill = require('../modules/Bill');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.render('index', {
            transactions: [],
            bills: [],
            stats: { balance: 0, income: 0, expense: 0, savingsRate: 0 },
            query: {}
        });
    }

    try {
        const { q, date, sortBy = 'date', order = 'desc' } = req.query;
        let transactionQuery = { userId: req.session.user.id };

        if (q) {
            transactionQuery.name = { $regex: q, $options: 'i' };
        }

        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            transactionQuery.date = {
                $gte: searchDate,
                $lt: nextDay
            };
        }

        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        const [transactions, bills] = await Promise.all([
            Transaction.find(transactionQuery).sort(sortOptions),
            Bill.find({ userId: req.session.user.id }).sort({ dueDate: 1 })
        ]);

        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            const amount = Number(t.amount) || 0;
            if (t.type === 'income') {
                income += amount;
            } else if (t.type === 'expense') {
                expense += amount;
            }
        });

        const balance = income - expense;
        const savingsRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : 0;

        res.render('index', {
            transactions,
            bills,
            stats: { balance, income, expense, savingsRate },
            query: req.query
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.render('index', {
            transactions: [],
            bills: [],
            stats: { balance: 0, income: 0, expense: 0, savingsRate: 0 },
            query: req.query
        });
    }
});

router.get('/dashboard', isLoggedIn, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.session.user.id });

        // Data structures for charts
        const monthlyIncomeArr = new Array(12).fill(0);
        const monthlyExpenseArr = new Array(12).fill(0);
        const allMonthDailyExpenses = Array.from({ length: 12 }, () => new Array(31).fill(0));

        let totalIncome = 0;
        let totalExpense = 0;

        const currentYear = new Date().getFullYear();

        transactions.forEach(t => {
            const date = new Date(t.date);
            const month = date.getMonth();
            const day = date.getDate() - 1; // 0-indexed for array
            const amount = Number(t.amount) || 0;

            if (date.getFullYear() === currentYear) {
                if (t.type === 'income') {
                    monthlyIncomeArr[month] += amount;
                } else if (t.type === 'expense') {
                    monthlyExpenseArr[month] += amount;
                    if (day < 31) {
                        allMonthDailyExpenses[month][day] += amount;
                    }
                }
            }

            // For overall stats
            if (t.type === 'income') totalIncome += amount;
            else if (t.type === 'expense') totalExpense += amount;
        });

        // Current Month Stats
        const now = new Date();
        const currMonthIncome = monthlyIncomeArr[now.getMonth()];
        const currMonthExpense = monthlyExpenseArr[now.getMonth()];
        const currMonthSaving = currMonthIncome - currMonthExpense;
        const savingsRate = currMonthIncome > 0 ? ((currMonthSaving / currMonthIncome) * 100).toFixed(1) : 0;

        res.render('dashboard', {
            stats: {
                income: currMonthIncome,
                expense: currMonthExpense,
                saving: currMonthSaving,
                rate: savingsRate
            },
            chartData: {
                monthlyIncome: monthlyIncomeArr,
                monthlyExpense: monthlyExpenseArr,
                allMonthDailyExpenses: allMonthDailyExpenses
            }
        });
    } catch (err) {
        console.error('Dashboard Error:', err);
        res.redirect('/');
    }
});

router.get('/about', (req, res) => {
    res.render('about');
});

router.get('/help', (req, res) => {
    res.render('help');
});

router.get('/education', (req, res) => {
    res.render('education');
});

module.exports = router;
