import productService from '../services/product.service.js';
import categoryService from '../services/category.service.js';

class PublicController {
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

            res.render('public/products/detail', {
                layout: 'layouts/main',
                title: product.name,
                product,
                csrfToken: req.csrfToken ? req.csrfToken() : null
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
}

export default new PublicController();
