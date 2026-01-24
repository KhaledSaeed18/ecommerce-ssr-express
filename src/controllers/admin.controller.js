import sessionService from '../services/session.service.js';
import productService from '../services/product.service.js';
import categoryService from '../services/category.service.js';
import contactService from '../services/contact.service.js';
import orderService from '../services/order.service.js';

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
            const unreadMessages = await contactService.getUnreadCount();
            const totalContacts = await contactService.getTotalCount();
            const orderStats = await orderService.getOrderStats();

            res.render('admin/dashboard', {
                layout: 'layouts/admin',
                title: 'Admin Dashboard',
                currentPage: 'dashboard',
                sessions,
                totalProducts: productsResult.total,
                totalCategories: categories.length,
                unreadMessages,
                totalContacts,
                orderStats,
                csrfToken: req.csrfToken(),
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).send('Error loading dashboard');
        }
    }

    /**
     * GET /admin/contacts
     * List all contact messages
     */
    async listContacts(req, res) {
        try {
            const contacts = await contactService.getAllContacts();

            res.render('admin/contacts/list', {
                layout: 'layouts/admin',
                title: 'Contact Messages',
                currentPage: 'contacts',
                contacts,
                csrfToken: req.csrfToken(),
            });
        } catch (error) {
            console.error('List contacts error:', error);
            res.status(500).send('Error loading contact messages');
        }
    }

    /**
     * POST /admin/contacts/:id/mark-read
     * Mark a contact message as read
     */
    async markContactAsRead(req, res) {
        try {
            await contactService.markAsRead(req.params.id);
            res.redirect('/admin/contacts');
        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).send('Error marking message as read');
        }
    }

    /**
     * POST /admin/contacts/:id/delete
     * Delete a contact message
     */
    async deleteContact(req, res) {
        try {
            await contactService.deleteContact(req.params.id);
            res.redirect('/admin/contacts');
        } catch (error) {
            console.error('Delete contact error:', error);
            res.status(500).send('Error deleting message');
        }
    }
}

export default new AdminController();
