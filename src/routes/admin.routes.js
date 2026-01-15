import express from 'express';
import adminController from '../controllers/admin.controller.js';
import requireAuth from '../middlewares/requireAuth.js';
import requireRole from '../middlewares/requireRole.js';
import csrfProtection from '../middlewares/csrf.js';

const router = express.Router();

/**
 * GET /admin/dashboard
 * Admin dashboard - requires admin role
 */
router.get('/dashboard', requireAuth, requireRole('admin'), csrfProtection, adminController.showDashboard);

export default router;
