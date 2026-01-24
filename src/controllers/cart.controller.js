import cartService from '../services/cart.service.js';

const cartController = {
    /**
     * Get cart page
     * GET /cart
     */
    async getCart(req, res) {
        try {
            const cart = await cartService.getCart(req.session.userId);

            res.render('cart/index', {
                layout: 'layouts/dashboard',
                title: 'Shopping Cart',
                currentPage: 'cart',
                cart,
                error: null,
                success: null,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Get cart error:', error);
            res.render('cart/index', {
                layout: 'layouts/dashboard',
                title: 'Shopping Cart',
                currentPage: 'cart',
                cart: { items: [], totalItems: 0, totalPrice: 0 },
                error: 'Failed to load cart',
                success: null,
                csrfToken: req.csrfToken()
            });
        }
    },

    /**
     * Add item to cart
     * POST /cart/add
     */
    async addItem(req, res) {
        try {
            const { productId, quantity } = req.body;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID is required'
                });
            }

            const parsedQuantity = parseInt(quantity) || 1;

            const cart = await cartService.addItem(
                req.session.userId,
                productId,
                parsedQuantity
            );

            // If it's an AJAX request, return JSON
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({
                    success: true,
                    message: 'Product added to cart',
                    cart: {
                        totalItems: cart.totalItems,
                        totalPrice: cart.totalPrice
                    }
                });
            }

            // Otherwise redirect to cart
            req.session.successMessage = 'Product added to cart';
            res.redirect('/cart');
        } catch (error) {
            console.error('Add to cart error:', error);

            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            req.session.errorMessage = error.message;
            const referer = req.get('Referer') || '/products';
            res.redirect(referer);
        }
    },

    /**
     * Update item quantity
     * POST /cart/update
     */
    async updateItem(req, res) {
        try {
            const { productId, quantity } = req.body;

            if (!productId || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID and quantity are required'
                });
            }

            const parsedQuantity = parseInt(quantity);

            const cart = await cartService.updateItemQuantity(
                req.session.userId,
                productId,
                parsedQuantity
            );

            res.json({
                success: true,
                message: 'Cart updated',
                cart: {
                    totalItems: cart.totalItems,
                    totalPrice: cart.totalPrice
                }
            });
        } catch (error) {
            console.error('Update cart error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Remove item from cart
     * POST /cart/remove
     */
    async removeItem(req, res) {
        try {
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID is required'
                });
            }

            const cart = await cartService.removeItem(
                req.session.userId,
                productId
            );

            res.json({
                success: true,
                message: 'Product removed from cart',
                cart: {
                    totalItems: cart.totalItems,
                    totalPrice: cart.totalPrice
                }
            });
        } catch (error) {
            console.error('Remove from cart error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Clear cart
     * POST /cart/clear
     */
    async clearCart(req, res) {
        try {
            await cartService.clearCart(req.session.userId);

            // If AJAX request, return JSON
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({
                    success: true,
                    message: 'Cart cleared'
                });
            }

            req.session.successMessage = 'Cart cleared';
            res.redirect('/cart');
        } catch (error) {
            console.error('Clear cart error:', error);

            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            req.session.errorMessage = error.message;
            res.redirect('/cart');
        }
    }
};

export default cartController;
