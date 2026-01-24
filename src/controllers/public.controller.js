import productService from '../services/product.service.js';
import categoryService from '../services/category.service.js';
import sessionService from '../services/session.service.js';

class PublicController {
    /**
     * GET /
     * Home page
     */
    async home(req, res) {
        try {
            // Get all active categories with product count
            const categories = await categoryService.getAllCategories(false);

            // Get featured products (randomly select 6 active products)
            const allProducts = await productService.getAllProducts({
                page: 1,
                limit: 100,
                isActive: true
            });

            // Shuffle and take 6 products
            const shuffled = allProducts.products.sort(() => 0.5 - Math.random());
            const featuredProducts = shuffled.slice(0, 6);

            res.render('home', {
                layout: 'layouts/main',
                title: 'Home',
                categories,
                featuredProducts,
                csrfToken: req.csrfToken ? req.csrfToken() : null
            });
        } catch (error) {
            console.error('Home page error:', error);
            res.status(500).send('Error loading home page');
        }
    }

    /**
     * GET /products
     * Public product listing
     */
    async listProducts(req, res) {
        try {
            const { page = 1, category, search, minPrice, maxPrice, sort = '-createdAt' } = req.query;

            const result = await productService.getAllProducts({
                page,
                limit: 12,
                category,
                search,
                minPrice,
                maxPrice,
                isActive: true,
                sort
            });

            const categories = await categoryService.getAllCategories(false);

            res.render('public/products/list', {
                layout: 'layouts/main',
                title: search ? `Search: ${search}` : 'Products',
                ...result,
                categories,
                currentCategory: null,
                csrfToken: req.csrfToken ? req.csrfToken() : null,
                filters: {
                    category: category || '',
                    search: search || '',
                    minPrice: minPrice || '',
                    maxPrice: maxPrice || '',
                    sort
                }
            });
        } catch (error) {
            console.error('Public list products error:', error);
            res.status(500).send('Error loading products');
        }
    }

    /**
     * GET /products/:slug
     * Public product detail
     */
    async showProduct(req, res) {
        try {
            const product = await productService.getProductBySlug(req.params.slug);

            if (!product) {
                return res.status(404).render('404', {
                    layout: 'layouts/main',
                    title: '404 - Product Not Found'
                });
            }

            // Get related products from the same category
            const relatedProducts = await productService.getAllProducts({
                category: product.category._id,
                isActive: true,
                limit: 5,
                sort: '-createdAt'
            });

            // Filter out the current product
            const filteredRelated = relatedProducts.products.filter(
                p => p._id.toString() !== product._id.toString()
            ).slice(0, 4);

            res.render('public/products/detail', {
                layout: 'layouts/main',
                title: product.name,
                product,
                relatedProducts: filteredRelated,
                csrfToken: req.csrfToken ? req.csrfToken() : undefined
            });
        } catch (error) {
            console.error('Show product error:', error);
            res.status(500).send('Error loading product');
        }
    }

    /**
     * GET /categories/:slug
     * Public category products
     */
    async showCategory(req, res) {
        try {
            const category = await categoryService.getCategoryBySlug(req.params.slug);

            if (!category) {
                return res.status(404).render('404', {
                    layout: 'layouts/main',
                    title: '404 - Category Not Found'
                });
            }

            const { page = 1 } = req.query;

            const result = await productService.getAllProducts({
                page,
                limit: 12,
                category: category._id,
                isActive: true,
                sort: '-createdAt'
            });

            const categories = await categoryService.getAllCategories(false);

            res.render('public/products/list', {
                layout: 'layouts/main',
                title: category.name,
                ...result,
                categories,
                currentCategory: category,
                csrfToken: req.csrfToken ? req.csrfToken() : null,
                filters: {
                    category: category._id.toString(),
                    search: '',
                    minPrice: '',
                    maxPrice: '',
                    sort: '-createdAt'
                }
            });
        } catch (error) {
            console.error('Show category error:', error);
            res.status(500).send('Error loading category');
        }
    }

    /**
     * GET /about
     * About page
     */
    async about(req, res) {
        try {
            // Get all active categories for footer
            const categories = await categoryService.getAllCategories(false);

            res.render('about', {
                layout: 'layouts/main',
                title: 'About Us',
                categories,
                csrfToken: req.csrfToken ? req.csrfToken() : null
            });
        } catch (error) {
            console.error('About page error:', error);
            res.status(500).send('Error loading about page');
        }
    }
}

export default new PublicController();
