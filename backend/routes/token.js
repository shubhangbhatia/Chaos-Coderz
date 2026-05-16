/**
 * Token Routes
 * 
 * Handles JWT token refresh and token status checking.
 * These are API-style endpoints (JSON responses) for future SPA/mobile support.
 */

const express = require('express');
const router = express.Router();
const { verifyRefreshToken, setTokenCookies, clearTokenCookies } = require('../utils/jwtUtils');
const User = require('../modules/User');

/**
 * POST /api/token/refresh
 * 
 * Uses the refresh token (from HTTP-only cookie) to issue a new access token.
 * If the refresh token is invalid/expired, returns 401.
 */
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token provided',
            });
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            clearTokenCookies(res);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
        }

        // Verify user still exists in the database
        const user = await User.findById(decoded.id);
        if (!user) {
            clearTokenCookies(res);
            return res.status(401).json({
                success: false,
                message: 'User no longer exists',
            });
        }

        // Issue new token pair
        setTokenCookies(res, user);

        // Also refresh the session
        if (req.session) {
            req.session.user = { id: user._id, username: user.username };
        }

        return res.status(200).json({
            success: true,
            message: 'Tokens refreshed successfully',
            user: { id: user._id, username: user.username },
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

/**
 * GET /api/token/status
 * 
 * Check if the current user is authenticated (via JWT or session).
 * Useful for frontend JS to determine auth state.
 */
router.get('/status', (req, res) => {
    // Check JWT
    const accessToken = req.cookies?.accessToken;
    if (accessToken) {
        const { verifyAccessToken } = require('../utils/jwtUtils');
        const decoded = verifyAccessToken(accessToken);
        if (decoded) {
            return res.status(200).json({
                authenticated: true,
                method: 'jwt',
                user: { id: decoded.id, username: decoded.username },
            });
        }
    }

    // Fallback to session
    if (req.session?.user) {
        return res.status(200).json({
            authenticated: true,
            method: 'session',
            user: req.session.user,
        });
    }

    return res.status(200).json({
        authenticated: false,
    });
});

module.exports = router;
