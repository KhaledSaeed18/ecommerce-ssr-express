import express from 'express';
import adminOrderController from '../controllers/adminOrder.controller.js';
import csrf from '../middlewares/csrf.js';

const router = express.Router();

// Order management routes
router.get('/orders', csrf, adminOrderController.showOrders);
router.get('/orders/:id', csrf, adminOrderController.showOrderDetail);
router.post('/orders/:id/status', csrf, adminOrderController.updateOrderStatus);

export default router;
