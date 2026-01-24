import orderService from '../services/order.service.js';
import cartService from '../services/cart.service.js';

class OrderController {
    /**
     * Show checkout page
     */
    async showCheckout(req, res) {
        try {
            const cart = await cartService.getCart(req.user._id);

            if (!cart || cart.items.length === 0) {
                return res.redirect('/cart');
            }

            res.render('checkout/index', {
                layout: 'layouts/main',
                title: 'Checkout',
                cart,
                error: null,
                success: null,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Error showing checkout:', error);
            res.redirect('/cart');
        }
    }

    /**
     * Process checkout and create order
     */
    async processCheckout(req, res) {
        try {
            const { fullName, phone, address, city, postalCode, notes } = req.body;

            // Validate required fields
            if (!fullName || !phone || !address || !city || !postalCode) {
                const cart = await cartService.getCart(req.user._id);
                return res.render('checkout/index', {
                    layout: 'layouts/main',
                    title: 'Checkout',
                    cart,
                    error: 'Please fill all required fields',
                    success: null,
                    csrfToken: req.csrfToken()
                });
            }

            const shippingAddress = {
                fullName,
                phone,
                address,
                city,
                postalCode
            };

            const order = await orderService.createOrder(
                req.user._id,
                shippingAddress,
                notes
            );

            res.redirect(`/orders/${order._id}`);
        } catch (error) {
            console.error('Error processing checkout:', error);
            const cart = await cartService.getCart(req.user._id);
            res.render('checkout/index', {
                layout: 'layouts/main',
                title: 'Checkout',
                cart,
                error: error.message || 'Failed to place order',
                success: null,
                csrfToken: req.csrfToken()
            });
        }
    }

    /**
     * Show user's orders list
     */
    async showOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const result = await orderService.getUserOrders(req.user._id, page, 10);

            res.render('orders/list', {
                layout: 'layouts/dashboard',
                title: 'My Orders',
                currentPage: 'orders',
                error: null,
                success: null,
                csrfToken: req.csrfToken(),
                ...result
            });
        } catch (error) {
            console.error('Error showing orders:', error);
            res.status(500).render('orders/list', {
                layout: 'layouts/dashboard',
                title: 'My Orders',
                currentPage: 'orders',
                error: 'Failed to load orders',
                success: null,
                csrfToken: req.csrfToken(),
                orders: [],
                pagination: { page: 1, limit: 10, total: 0, pages: 0 }
            });
        }
    }

    /**
     * Show single order detail
     */
    async showOrderDetail(req, res) {
        try {
            const order = await orderService.getUserOrder(req.params.id, req.user._id);

            res.render('orders/detail', {
                layout: 'layouts/dashboard',
                title: `Order ${order.orderNumber}`,
                currentPage: 'orders',
                error: null,
                success: null,
                csrfToken: req.csrfToken(),
                order
            });
        } catch (error) {
            console.error('Error showing order detail:', error);
            res.redirect('/orders');
        }
    }

    /**
     * Cancel order
     */
    async cancelOrder(req, res) {
        try {
            await orderService.cancelOrder(req.params.id, req.user._id);
            res.redirect(`/orders/${req.params.id}`);
        } catch (error) {
            console.error('Error cancelling order:', error);
            res.redirect(`/orders/${req.params.id}`);
        }
    }
}

export default new OrderController();
