import authService from '../services/auth.service.js';

/**
 * Middleware to inject common variables into res.locals
 * Makes them available in all EJS templates
 */
const locals = async (req, res, next) => {
    try {
        // Check if user is authenticated
        const isAuthenticated = !!req.session?.userId;

        // Fetch user data if authenticated and not already loaded
        let user = req.user || null;
        if (isAuthenticated && !user && req.session.userId) {
            user = await authService.getUserById(req.session.userId);
        }

        // Make user available in templates
        res.locals.user = user;
        res.locals.isAuthenticated = isAuthenticated;
        res.locals.userRole = req.session?.role || null;

        next();
    } catch (error) {
        console.error('Locals middleware error:', error);
        res.locals.user = null;
        res.locals.isAuthenticated = false;
        res.locals.userRole = null;
        next();
    }
};

export default locals;
