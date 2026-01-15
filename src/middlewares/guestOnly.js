/**
 * Middleware to block authenticated users from accessing guest-only pages
 * (e.g., login and register pages)
 */
const guestOnly = (req, res, next) => {
    if (req.session && req.session.userId) {
        // User is logged in, redirect based on role
        const role = req.session.role || 'user';
        return res.redirect(role === 'admin' ? '/admin/dashboard' : '/');
    }

    next();
};

export default guestOnly;
