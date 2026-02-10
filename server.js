require('dotenv').config();
const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// App Configuration
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'backend', 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend', 'public')));
app.use('/CSS', express.static(path.join(__dirname, 'frontend', 'CSS')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.session ? req.session.user : null;
    next();
});

// Import Routes
const indexRoutes = require('./backend/routes/index');
const authRoutes = require('./backend/routes/auth');
const transactionRoutes = require('./backend/routes/transactions');

// Use Routes
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).send('Something went wrong on the server.');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
