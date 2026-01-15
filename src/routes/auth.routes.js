import express from 'express';
import rateLimit from 'express-rate-limit';
import authController from '../controllers/auth.controller.js';
import guestOnly from '../middlewares/guestOnly.js';
import requireAuth from '../middlewares/requireAuth.js';
import csrfProtection from '../middlewares/csrf.js';

const router = express.Router();

// Rate limiter for login route
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * GET /auth/register
 */
router.get('/register', guestOnly, csrfProtection, authController.showRegister);

/**
 * POST /auth/register
 */
router.post('/register', guestOnly, csrfProtection, authController.register);

/**
 * GET /auth/login
 */
router.get('/login', guestOnly, csrfProtection, authController.showLogin);

/**
 * POST /auth/login
 */
router.post('/login', guestOnly, loginLimiter, csrfProtection, authController.login);

/**
 * POST /auth/logout
 */
router.post('/logout', requireAuth, csrfProtection, authController.logout);

/**
 * POST /auth/logout-all
 */
router.post('/logout-all', requireAuth, csrfProtection, authController.logoutAll);

export default router;
