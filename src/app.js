import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import sessionMiddleware from './config/session.js';
import locals from './middlewares/locals.js';

// Import routes
import indexRoutes from './routes/index.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import publicRoutes from './routes/public.routes.js';
import userRoutes from './routes/user.routes.js';
import contactRoutes from './routes/contact.routes.js';
import cartRoutes from './routes/cart.routes.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/lucide', express.static(path.join(__dirname, '../node_modules/lucide/dist/umd')));

// Session middleware
app.use(sessionMiddleware);

// Locals middleware (makes user available in templates)
app.use(locals);

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/categories', categoryRoutes);
app.use('/admin/products', productRoutes);
app.use('/', userRoutes);
app.use('/', publicRoutes);
app.use('/contact', contactRoutes);
app.use('/cart', cartRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        layout: 'layouts/main',
        title: '404 - Not Found',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // CSRF error
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).send('Invalid CSRF token');
    }

    res.status(500).send('Internal Server Error');
});

export default app;
