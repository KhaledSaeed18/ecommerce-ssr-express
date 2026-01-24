import { Router } from 'express';
import contactController from '../controllers/contact.controller.js';
import csrf from '../middlewares/csrf.js';

const router = Router();

// Apply CSRF protection
router.use(csrf);

// Contact form routes
router.get('/', contactController.showContactForm);
router.post('/', contactController.submitContactForm);

export default router;
