import express from 'express';
import csrfProtection from '../middlewares/csrf.js';

const router = express.Router();

/**
 * GET /
 * Home page - accessible to all
 */
router.get('/', csrfProtection, (req, res) => {
    res.render('home', {
        layout: 'layouts/main',
        title: 'Home',
        csrfToken: req.csrfToken(),
    });
});

export default router;
