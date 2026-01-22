import sessionService from '../services/session.service.js';

class UserController {
    /**
     * GET /dashboard
     * User dashboard overview
     */
    async dashboard(req, res) {
        try {
            const activeSessions = await sessionService.getUserActiveSessions(req.user._id);

            res.render('dashboard/overview', {
                layout: 'layouts/dashboard',
                title: 'Dashboard',
                currentPage: 'overview',
                activeSessions: activeSessions.length,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).send('Error loading dashboard');
        }
    }

    /**
     * GET /account/security
     * Security and session management
     */
    async security(req, res) {
        try {
            const sessions = await sessionService.getUserActiveSessions(req.user._id);

            // Use admin layout for admin users, dashboard layout for regular users
            const layout = req.user.role === 'admin' ? 'layouts/admin' : 'layouts/dashboard';

            res.render('account/security', {
                layout,
                title: 'Security & Sessions',
                currentPage: 'security',
                sessions,
                currentSessionId: req.sessionID,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Security page error:', error);
            res.status(500).send('Error loading security page');
        }
    }

    /**
     * POST /account/sessions/:sessionId/revoke
     * Revoke a specific session
     */
    async revokeSession(req, res) {
        try {
            const { sessionId } = req.params;

            // Don't allow revoking current session
            if (sessionId === req.sessionID) {
                return res.redirect('/account/security?error=' + encodeURIComponent('Cannot revoke current session. Use logout instead.'));
            }

            // Verify session belongs to current user
            const session = await sessionService.getSession(sessionId);
            if (!session || session.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/account/security?error=' + encodeURIComponent('Session not found'));
            }

            await sessionService.revokeSession(sessionId);

            res.redirect('/account/security?success=' + encodeURIComponent('Session revoked successfully'));
        } catch (error) {
            console.error('Revoke session error:', error);
            res.redirect('/account/security?error=' + encodeURIComponent('Failed to revoke session'));
        }
    }
}

export default new UserController();
