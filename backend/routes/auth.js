const express = require('express');
const router = express.Router();
const User = require('../modules/User');
const { isLoggedOut } = require('../middleware/authMiddleware');

router.get('/login', isLoggedOut, (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && user.password === password) {
            req.session.user = { id: user._id, username: user.username };
            res.redirect('/');
        } else {
            console.log('Login failed for:', username);
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/login');
    }
});

router.get('/signup', isLoggedOut, (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Signup attempt:', { username, email });

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('Signup failed: User already exists');
            return res.redirect('/signup');
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        console.log('User created successfully:', newUser._id);

        req.session.user = { id: newUser._id, username: newUser.username };
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.redirect('/login');
            }
            res.redirect('/');
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.redirect('/signup');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
