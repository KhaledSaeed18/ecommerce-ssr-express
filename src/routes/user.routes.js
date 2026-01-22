import express from 'express';
import userController from '../controllers/user.controller.js';
import requireAuth from '../middlewares/requireAuth.js';
import csrfProtection from '../middlewares/csrf.js';

const router = express.Router();

/**
 * GET /dashboard
 */
router.get('/dashboard', requireAuth, csrfProtection, userController.dashboard);

/**
 * GET /account/security
 */
router.get('/account/security', requireAuth, csrfProtection, userController.security);

/**
 * POST /account/sessions/:sessionId/revoke
 */
router.post('/account/sessions/:sessionId/revoke', requireAuth, csrfProtection, userController.revokeSession);

export default router;
