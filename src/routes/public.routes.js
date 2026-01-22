import express from 'express';
import publicController from '../controllers/public.controller.js';

const router = express.Router();

/**
 * GET /products
 * Public product listing with filters
 */
router.get('/products', publicController.listProducts);

/**
 * GET /products/:slug
 * Public product detail page
 */
router.get('/products/:slug', publicController.showProduct);

/**
 * GET /categories/:slug
 * Public category page with products
 */
router.get('/categories/:slug', publicController.showCategory);

export default router;
