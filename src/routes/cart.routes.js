import express from 'express';
import cartController from '../controllers/cart.controller.js';
import requireAuth from '../middlewares/requireAuth.js';
import csrfProtection from '../middlewares/csrf.js';

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

// Get cart page
router.get('/', csrfProtection, cartController.getCart);

// Add item to cart
router.post('/add', csrfProtection, cartController.addItem);

// Update item quantity
router.post('/update', csrfProtection, cartController.updateItem);

// Remove item from cart
router.post('/remove', csrfProtection, cartController.removeItem);

// Clear cart
router.post('/clear', csrfProtection, cartController.clearCart);

export default router;
