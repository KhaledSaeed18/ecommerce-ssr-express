import sessionService from '../services/session.service.js';
import productService from '../services/product.service.js';
import categoryService from '../services/category.service.js';

class AdminController {
    /**
     * GET /admin/dashboard
     */
    async showDashboard(req, res) {
        try {
            // Get active sessions for current user
            const sessions = await sessionService.getUserActiveSessions(req.user._id);

            // Get counts for dashboard stats
            const productsResult = await productService.getAllProducts({ limit: 1 });
            const categories = await categoryService.getAllCategories(true);

            res.render('admin/dashboard', {
                layout: 'layouts/admin',
                title: 'Admin Dashboard',
                currentPage: 'dashboard',
                sessions,
                totalProducts: productsResult.total,
                totalCategories: categories.length,
                csrfToken: req.csrfToken(),
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).send('Error loading dashboard');
        }
    }
}

export default new AdminController();
