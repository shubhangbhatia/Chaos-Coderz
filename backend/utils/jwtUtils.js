/**
 * JWT Token Utilities
 * 
 * Handles generation and verification of access tokens and refresh tokens.
 * - Access Token:  Short-lived (15 min), used for authenticating requests.
 * - Refresh Token: Long-lived (7 days), used to issue new access tokens.
 * 
 * Both tokens are stored in HTTP-only cookies (not localStorage) to prevent XSS.
 */

const jwt = require('jsonwebtoken');

// Secrets — pulled from .env, with fallbacks for development
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'finance-genie-access-secret-change-in-production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'finance-genie-refresh-secret-change-in-production';

// Token lifetimes
const ACCESS_TOKEN_EXPIRY = '15m';    // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';    // 7 days

// Cookie options
const COOKIE_OPTIONS = {
    httpOnly: true,       // Prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'strict',   // CSRF protection
};

/**
 * Generate an access token for a user
 * @param {Object} user - User object with _id and username
 * @returns {string} JWT access token
 */
function generateAccessToken(user) {
    return jwt.sign(
        { id: user._id || user.id, username: user.username },
        ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
}

/**
 * Generate a refresh token for a user
 * @param {Object} user - User object with _id and username
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { id: user._id || user.id, username: user.username },
        REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
}

/**
 * Verify an access token
 * @param {string} token - The JWT access token
 * @returns {Object|null} Decoded payload or null if invalid/expired
 */
function verifyAccessToken(token) {
    try {
        return jwt.verify(token, ACCESS_SECRET);
    } catch (err) {
        return null;
    }
}

/**
 * Verify a refresh token
 * @param {string} token - The JWT refresh token
 * @returns {Object|null} Decoded payload or null if invalid/expired
 */
function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, REFRESH_SECRET);
    } catch (err) {
        return null;
    }
}

/**
 * Set both access and refresh token cookies on the response
 * @param {Object} res - Express response object
 * @param {Object} user - User object
 */
function setTokenCookies(res, user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,           // 15 minutes in ms
    });

    res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in ms
        path: '/',                          // Available on all paths for refresh
    });
}

/**
 * Clear both token cookies (used on logout)
 * @param {Object} res - Express response object
 */
function clearTokenCookies(res) {
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, path: '/' });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    setTokenCookies,
    clearTokenCookies,
};
