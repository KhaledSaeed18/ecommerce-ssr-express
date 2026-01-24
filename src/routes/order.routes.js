import express from 'express';
import orderController from '../controllers/order.controller.js';
import requireAuth from '../middlewares/requireAuth.js';
import csrf from '../middlewares/csrf.js';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// Checkout routes
router.get('/checkout', csrf, orderController.showCheckout);
router.post('/checkout', csrf, orderController.processCheckout);

// Order routes
router.get('/orders', csrf, orderController.showOrders);
router.get('/orders/:id', csrf, orderController.showOrderDetail);
router.post('/orders/:id/cancel', csrf, orderController.cancelOrder);

export default router;
