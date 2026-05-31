const express = require('express');
const router = express.Router();
const User = require('../modules/User');
const { isLoggedOut } = require('../middleware/authMiddleware');
const { setTokenCookies, clearTokenCookies } = require('../utils/jwtUtils');
const { body, validationResult } = require('express-validator');

const loginValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required.')
        .escape(),
    body('password')
        .notEmpty().withMessage('Password is required.')
];

const signupValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required.')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters long.')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
];

router.get('/login', isLoggedOut, (req, res) => {
    res.render('login');
});

router.post('/login', loginValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('login', {
            errors: errors.array(),
            oldInput: { username: req.body.username }
        });
    }

    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            console.log('Login failed for:', username, '- user not found');
            return res.status(400).render('login', {
                errors: [{ msg: 'Invalid username or password.' }],
                oldInput: { username }
            });
        }

        const isMatch = await user.comparePassword(password);
        if (isMatch) {
            // Set JWT token cookies
            setTokenCookies(res, user);
            // Also set session for EJS template compatibility
            req.session.user = { id: user._id, username: user.username };
            res.redirect('/');
        } else {
            console.log('Login failed for:', username, '- incorrect password');
            res.status(400).render('login', {
                errors: [{ msg: 'Invalid username or password.' }],
                oldInput: { username }
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('login', {
            errors: [{ msg: 'An unexpected error occurred. Please try again.' }],
            oldInput: { username: req.body.username }
        });
    }
});

router.get('/signup', isLoggedOut, (req, res) => {
    res.render('signup');
});

router.post('/signup', signupValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('signup', {
            errors: errors.array(),
            oldInput: { username: req.body.username, email: req.body.email }
        });
    }

    try {
        const { username, email, password } = req.body;
        console.log('Signup attempt:', { username, email });

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('Signup failed: User already exists');
            return res.status(400).render('signup', {
                errors: [{ msg: 'Username or email already in use.' }],
                oldInput: { username, email }
            });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        console.log('User created successfully:', newUser._id);

        // Set JWT token cookies
        setTokenCookies(res, newUser);
        // Also set session for EJS template compatibility
        req.session.user = { id: newUser._id, username: newUser.username };
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).render('signup', {
                    errors: [{ msg: 'Unable to save your session. Please try logging in.' }],
                    oldInput: { username, email }
                });
            }
            res.redirect('/');
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).render('signup', {
            errors: [{ msg: 'An unexpected error occurred. Please try again.' }],
            oldInput: { username: req.body.username, email: req.body.email }
        });
    }
});

router.get('/logout', (req, res) => {
    // Clear JWT cookies
    clearTokenCookies(res);
    // Destroy session
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
