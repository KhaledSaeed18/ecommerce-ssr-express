import express from 'express';
import productController from '../controllers/product.controller.js';
import requireAuth from '../middlewares/requireAuth.js';
import requireRole from '../middlewares/requireRole.js';
import csrfProtection from '../middlewares/csrf.js';
import upload from '../config/upload.js';

const router = express.Router();

// Apply auth and admin role to all routes
router.use(requireAuth, requireRole('admin'));

/**
 * GET /admin/products
 * List all products
 */
router.get('/', csrfProtection, productController.listProducts);

/**
 * GET /admin/products/new
 * Show create product form
 */
router.get('/new', csrfProtection, productController.showCreateForm);

/**
 * POST /admin/products
 * Create new product with image upload
 */
router.post('/', upload.array('images', 5), csrfProtection, productController.createProduct);

/**
 * GET /admin/products/:id/edit
 * Show edit product form
 */
router.get('/:id/edit', csrfProtection, productController.showEditForm);

/**
 * POST /admin/products/:id
 * Update product with optional new images
 */
router.post('/:id', upload.array('images', 5), csrfProtection, productController.updateProduct);

/**
 * POST /admin/products/:id/delete
 * Delete product
 */
router.post('/:id/delete', csrfProtection, productController.deleteProduct);

/**
 * POST /admin/products/:id/images/:index/delete
 * Delete specific product image
 */
router.post('/:id/images/:index/delete', csrfProtection, productController.deleteImage);

/**
 * POST /admin/products/:id/toggle
 * Toggle product active status
 */
router.post('/:id/toggle', csrfProtection, productController.toggleStatus);

/**
 * POST /admin/products/:id/toggle-featured
 * Toggle product featured status
 */
router.post('/:id/toggle-featured', csrfProtection, productController.toggleFeatured);

export default router;
