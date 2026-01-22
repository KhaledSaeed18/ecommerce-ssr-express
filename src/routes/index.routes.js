import express from 'express';
import csrfProtection from '../middlewares/csrf.js';
import publicController from '../controllers/public.controller.js';

const router = express.Router();

/**
 * GET /
 * Home page - accessible to all
 */
router.get('/', csrfProtection, publicController.home);

export default router;
