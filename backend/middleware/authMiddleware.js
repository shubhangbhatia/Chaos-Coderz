const { verifyAccessToken, verifyRefreshToken, generateAccessToken } = require('../utils/jwtUtils');

/**
 * Hybrid Auth Middleware
 * 
 * Supports both JWT (cookie-based) and express-session authentication.
 * Priority: JWT access token → JWT refresh token (auto-rotate) → session fallback.
 * 
 * On successful JWT auth, it also populates req.session.user so that
 * EJS templates and route handlers that reference req.session.user continue working.
 */

const isLoggedIn = (req, res, next) => {
    // 1. Try JWT access token first
    const accessToken = req.cookies?.accessToken;
    if (accessToken) {
        const decoded = verifyAccessToken(accessToken);
        if (decoded) {
            // JWT is valid — populate session-compatible user object
            req.user = { id: decoded.id, username: decoded.username };
            if (req.session) req.session.user = req.user;
            res.locals.currentUser = req.user;
            return next();
        }
    }

    // 2. Access token missing/expired — try refresh token to auto-rotate
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded) {
            // Issue a new access token
            const newAccessToken = generateAccessToken({ _id: decoded.id, username: decoded.username });
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,  // 15 minutes
            });

            req.user = { id: decoded.id, username: decoded.username };
            if (req.session) req.session.user = req.user;
            res.locals.currentUser = req.user;
            return next();
        }
    }

    // 3. Fallback to session-based auth (backward compatibility)
    if (req.session?.user) {
        req.user = req.session.user;
        res.locals.currentUser = req.user;
        return next();
    }

    // Not authenticated
    return res.redirect('/login');
};

const isLoggedOut = (req, res, next) => {
    // Check JWT first
    const accessToken = req.cookies?.accessToken;
    if (accessToken) {
        const decoded = verifyAccessToken(accessToken);
        if (decoded) return res.redirect('/');
    }

    // Check refresh token
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded) return res.redirect('/');
    }

    // Fallback to session
    if (req.session?.user) {
        return res.redirect('/');
    }

    next();
};

module.exports = { isLoggedIn, isLoggedOut };

