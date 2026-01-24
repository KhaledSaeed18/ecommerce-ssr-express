import express from 'express';
import publicController from '../controllers/public.controller.js';
import csrfProtection from '../middlewares/csrf.js';

const router = express.Router();

// Conditional CSRF middleware - only apply if user is authenticated
const conditionalCsrf = (req, res, next) => {
    if (req.session && req.session.userId) {
        return csrfProtection(req, res, next);
    }
    next();
};

/**
 * GET /products
 * Public product listing with filters
 */
router.get('/products', conditionalCsrf, publicController.listProducts);

/**
 * GET /products/:slug
 * Public product detail page
 */
router.get('/products/:slug', conditionalCsrf, publicController.showProduct);

/**
 * GET /categories/:slug
 * Public category page with products
 */
router.get('/categories/:slug', conditionalCsrf, publicController.showCategory);

/**
 * GET /about
 * About page
 */
router.get('/about', publicController.about);

export default router;
