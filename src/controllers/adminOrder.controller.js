import orderService from '../services/order.service.js';

class AdminOrderController {
    /**
     * Show orders list in admin
     */
    async showOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const status = req.query.status || '';
            const search = req.query.search || '';

            const filters = {};
            if (status) filters.status = status;
            if (search) filters.search = search;

            const result = await orderService.getAllOrders(filters, page, 20);
            const stats = await orderService.getOrderStats();

            res.render('admin/orders/list', {
                layout: 'layouts/admin',
                title: 'Manage Orders',
                currentPage: 'orders',
                error: null,
                success: null,
                csrfToken: req.csrfToken(),
                ...result,
                stats,
                filters: { status, search }
            });
        } catch (error) {
            console.error('Error showing admin orders:', error);
            res.redirect('/admin/dashboard');
        }
    }

    /**
     * Show single order detail and management page
     */
    async showOrderDetail(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.id);

            res.render('admin/orders/detail', {
                layout: 'layouts/admin',
                title: `Order ${order.orderNumber}`,
                currentPage: 'orders',
                error: null,
                success: null,
                order,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Error showing order detail:', error);
            res.redirect('/admin/orders');
        }
    }

    /**
     * Update order status
     */
    async updateOrderStatus(req, res) {
        try {
            const { status, comment } = req.body;

            if (!status) {
                return res.redirect(`/admin/orders/${req.params.id}`);
            }

            // Validate rejection reason
            if (status === 'rejected' && !comment) {
                return res.redirect(`/admin/orders/${req.params.id}`);
            }

            await orderService.updateOrderStatus(
                req.params.id,
                status,
                req.user._id,
                comment
            );

            res.redirect(`/admin/orders/${req.params.id}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            res.redirect(`/admin/orders/${req.params.id}`);
        }
    }
}

export default new AdminOrderController();
