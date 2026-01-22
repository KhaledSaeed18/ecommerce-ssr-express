import express from 'express';
import categoryController from '../controllers/category.controller.js';
import requireAuth from '../middlewares/requireAuth.js';
import requireRole from '../middlewares/requireRole.js';
import csrfProtection from '../middlewares/csrf.js';

const router = express.Router();

// Apply auth and admin role to all routes
router.use(requireAuth, requireRole('admin'), csrfProtection);

/**
 * GET /admin/categories
 * List all categories
 */
router.get('/', categoryController.listCategories);

/**
 * GET /admin/categories/new
 * Show create category form
 */
router.get('/new', categoryController.showCreateForm);

/**
 * POST /admin/categories
 * Create new category
 */
router.post('/', categoryController.createCategory);

/**
 * GET /admin/categories/:id/edit
 * Show edit category form
 */
router.get('/:id/edit', categoryController.showEditForm);

/**
 * POST /admin/categories/:id
 * Update category
 */
router.post('/:id', categoryController.updateCategory);

/**
 * POST /admin/categories/:id/delete
 * Delete category
 */
router.post('/:id/delete', categoryController.deleteCategory);

/**
 * POST /admin/categories/:id/toggle
 * Toggle category active status
 */
router.post('/:id/toggle', categoryController.toggleStatus);

export default router;
