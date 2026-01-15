import authService from '../services/auth.service.js';
import sessionService from '../services/session.service.js';

/**
 * Middleware to require authentication
 * Validates:
 * - Session exists
 * - UserSession is valid and not revoked
 * - User is active
 * - passwordChangedAt < session.createdAt
 */
const requireAuth = async (req, res, next) => {
    try {
        // Check if session exists
        if (!req.session || !req.session.userId) {
            return res.redirect('/auth/login');
        }

        // Get session ID from express-session
        const sessionId = req.sessionID;

        // Validate session in database
        const validation = await sessionService.validateSession(sessionId);
        if (!validation.valid) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        // Get user
        const user = await authService.getUserById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        // Check if user is active
        if (user.status !== 'active') {
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        // Check if password was changed after session creation
        if (user.passwordChangedAt && req.session.createdAt) {
            const passwordChangedTime = new Date(user.passwordChangedAt).getTime();
            const sessionCreatedTime = new Date(req.session.createdAt).getTime();

            if (passwordChangedTime > sessionCreatedTime) {
                // Password changed after session created - invalidate session
                await sessionService.revokeSession(sessionId);
                req.session.destroy();
                return res.redirect('/auth/login');
            }
        }

        // Update last seen
        await sessionService.updateLastSeen(sessionId);

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.redirect('/auth/login');
    }
};

export default requireAuth;
