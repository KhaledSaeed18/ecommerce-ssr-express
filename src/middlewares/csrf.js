import csrf from 'csurf';

// Initialize CSRF protection
const csrfProtection = csrf({ cookie: false }); // Using session-based CSRF

export default csrfProtection;
