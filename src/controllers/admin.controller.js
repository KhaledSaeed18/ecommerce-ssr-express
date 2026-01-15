import sessionService from '../services/session.service.js';

class AdminController {
    /**
     * GET /admin/dashboard
     */
    async showDashboard(req, res) {
        try {
            // Get active sessions for current user
            const sessions = await sessionService.getUserActiveSessions(req.user._id);

            res.render('admin/dashboard', {
                layout: 'layouts/admin',
                title: 'Admin Dashboard',
                sessions,
                csrfToken: req.csrfToken(),
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).send('Error loading dashboard');
        }
    }
}

export default new AdminController();
