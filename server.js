require('dotenv').config();
const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');

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
app.use(cookieParser());
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

// Global middleware: populate currentUser from JWT or session
app.use((req, res, next) => {
    // Try JWT first
    if (req.cookies?.accessToken) {
        const { verifyAccessToken } = require('./backend/utils/jwtUtils');
        const decoded = verifyAccessToken(req.cookies.accessToken);
        if (decoded) {
            req.user = { id: decoded.id, username: decoded.username };
            if (req.session) req.session.user = req.user;
            res.locals.currentUser = req.user;
            return next();
        }
    }

    // Try refresh token
    if (req.cookies?.refreshToken) {
        const { verifyRefreshToken, generateAccessToken } = require('./backend/utils/jwtUtils');
        const decoded = verifyRefreshToken(req.cookies.refreshToken);
        if (decoded) {
            const newAccessToken = generateAccessToken({ _id: decoded.id, username: decoded.username });
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            });
            req.user = { id: decoded.id, username: decoded.username };
            if (req.session) req.session.user = req.user;
            res.locals.currentUser = req.user;
            return next();
        }
    }

    // Fallback to session
    res.locals.currentUser = req.session ? req.session.user : null;
    next();
});

// Import Routes
const indexRoutes = require('./backend/routes/index');
const authRoutes = require('./backend/routes/auth');
const transactionRoutes = require('./backend/routes/transactions');
const tokenRoutes = require('./backend/routes/token');

// Use Routes
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', transactionRoutes);
app.use('/api/token', tokenRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).send('Something went wrong on the server.');
});

// Initialize Email Service and Bill Scheduler
const { initializeEmailService } = require('./backend/utils/emailService');
const { startBillScheduler } = require('./backend/utils/billScheduler');

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    // Initialize email service
    const emailInitialized = initializeEmailService();

    // Start bill scheduler only if email service is initialized
    if (emailInitialized) {
        startBillScheduler();
    } else {
        console.warn('⚠️ Email service not initialized. Bill scheduler will not start.');
        console.warn('⚠️ Please configure email credentials in .env file to enable notifications.');
    }
});
