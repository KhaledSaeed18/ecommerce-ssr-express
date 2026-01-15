import authService from '../services/auth.service.js';
import sessionService from '../services/session.service.js';

class AuthController {
    /**
     * GET /auth/register
     */
    showRegister(req, res) {
        res.render('auth/register', {
            layout: 'layouts/auth',
            title: 'Register',
            csrfToken: req.csrfToken(),
            error: null,
        });
    }

    /**
     * POST /auth/register
     */
    async register(req, res) {
        try {
            const { email, password, confirmPassword } = req.body;

            // Basic validation
            if (!email || !password || !confirmPassword) {
                return res.render('auth/register', {
                    layout: 'layouts/auth',
                    title: 'Register',
                    csrfToken: req.csrfToken(),
                    error: 'All fields are required',
                });
            }

            if (password !== confirmPassword) {
                return res.render('auth/register', {
                    layout: 'layouts/auth',
                    title: 'Register',
                    csrfToken: req.csrfToken(),
                    error: 'Passwords do not match',
                });
            }

            if (password.length < 8) {
                return res.render('auth/register', {
                    layout: 'layouts/auth',
                    title: 'Register',
                    csrfToken: req.csrfToken(),
                    error: 'Password must be at least 8 characters',
                });
            }

            // Register user
            await authService.register(email, password);

            // Redirect to login
            res.redirect('/auth/login?registered=true');
        } catch (error) {
            console.error('Register error:', error);
            res.render('auth/register', {
                layout: 'layouts/auth',
                title: 'Register',
                csrfToken: req.csrfToken(),
                error: error.message || 'Registration failed',
            });
        }
    }

    /**
     * GET /auth/login
     */
    showLogin(req, res) {
        const registered = req.query.registered === 'true';
        res.render('auth/login', {
            layout: 'layouts/auth',
            title: 'Login',
            csrfToken: req.csrfToken(),
            error: null,
            success: registered ? 'Registration successful! Please login.' : null,
        });
    }

    /**
     * POST /auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Basic validation
            if (!email || !password) {
                return res.render('auth/login', {
                    layout: 'layouts/auth',
                    title: 'Login',
                    csrfToken: req.csrfToken(),
                    error: 'Email and password are required',
                    success: null,
                });
            }

            // Authenticate user
            const user = await authService.login(email, password);

            // Create express session
            req.session.userId = user._id.toString();
            req.session.role = user.role;
            req.session.createdAt = new Date();

            // Wait for session to be saved
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Create UserSession record
            const ip = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('user-agent') || 'Unknown';
            await sessionService.createSession(user._id, req.sessionID, ip, userAgent);

            // Redirect based on role
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            res.render('auth/login', {
                layout: 'layouts/auth',
                title: 'Login',
                csrfToken: req.csrfToken(),
                error: error.message || 'Login failed',
                success: null,
            });
        }
    }

    /**
     * POST /auth/logout
     */
    async logout(req, res) {
        try {
            // Revoke session
            await sessionService.revokeSession(req.sessionID);

            // Destroy express session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Logout error:', err);
                }
                res.redirect('/auth/login');
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.redirect('/');
        }
    }

    /**
     * POST /auth/logout-all
     */
    async logoutAll(req, res) {
        try {
            const userId = req.session.userId;

            // Revoke all user sessions
            await sessionService.revokeAllUserSessions(userId);

            // Destroy current express session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Logout all error:', err);
                }
                res.redirect('/auth/login');
            });
        } catch (error) {
            console.error('Logout all error:', error);
            res.redirect('/');
        }
    }
}

export default new AuthController();
