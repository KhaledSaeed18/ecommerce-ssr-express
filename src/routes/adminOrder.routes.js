import express from 'express';
import adminOrderController from '../controllers/adminOrder.controller.js';
import requireAuth from '../middlewares/requireAuth.js';
import requireRole from '../middlewares/requireRole.js';
import csrf from '../middlewares/csrf.js';

const router = express.Router();

// Apply authentication and authorization to all routes
router.use(requireAuth);
router.use(requireRole('admin'));

// Order management routes
router.get('/orders', csrf, adminOrderController.showOrders);
router.get('/orders/:id', csrf, adminOrderController.showOrderDetail);
router.post('/orders/:id/status', csrf, adminOrderController.updateOrderStatus);

export default router;
