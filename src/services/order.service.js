import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';

class OrderService {
    /**
     * Create a new order from user's cart
     */
    async createOrder(userId, shippingAddress, notes = '') {
        // Get user's cart with populated products
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        // Validate all products are available
        const unavailableProducts = [];
        const outOfStockProducts = [];

        for (const item of cart.items) {
            if (!item.product) {
                unavailableProducts.push('Unknown product');
                continue;
            }

            if (!item.product.isActive) {
                unavailableProducts.push(item.product.name);
            }

            if (item.product.stock < item.quantity) {
                outOfStockProducts.push({
                    name: item.product.name,
                    available: item.product.stock,
                    requested: item.quantity
                });
            }
        }

        if (unavailableProducts.length > 0) {
            throw new Error(`Products unavailable: ${unavailableProducts.join(', ')}`);
        }

        if (outOfStockProducts.length > 0) {
            const details = outOfStockProducts.map(p =>
                `${p.name} (requested: ${p.requested}, available: ${p.available})`
            ).join(', ');
            throw new Error(`Insufficient stock: ${details}`);
        }

        // Create order items from cart
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            image: item.product.images && item.product.images.length > 0
                ? item.product.images[0].url
                : ''
        }));

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create order
        const order = new Order({
            orderNumber,
            user: userId,
            items: orderItems,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            shippingAddress,
            paymentMethod: 'COD',
            status: 'pending',
            notes,
            statusHistory: [{
                status: 'pending',
                comment: 'Order placed',
                updatedAt: new Date()
            }]
        });

        await order.save();

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear cart
        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;
        await cart.save();

        return order;
    }

    /**
     * Get all orders for a user
     */
    async getUserOrders(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('items.product', 'name slug')
            .lean();

        const total = await Order.countDocuments({ user: userId });

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get single order by ID for a user
     */
    async getUserOrder(orderId, userId) {
        const order = await Order.findOne({ _id: orderId, user: userId })
            .populate('items.product', 'name slug images')
            .lean();

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    /**
     * Get all orders (admin)
     */
    async getAllOrders(filters = {}, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const query = {};

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.search) {
            query.orderNumber = { $regex: filters.search, $options: 'i' };
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'email')
            .populate('items.product', 'name slug')
            .lean();

        const total = await Order.countDocuments(query);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get single order by ID (admin)
     */
    async getOrderById(orderId) {
        const order = await Order.findById(orderId)
            .populate('user', 'email')
            .populate('items.product', 'name slug images stock isActive')
            .populate('statusHistory.updatedBy', 'email')
            .lean();

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    /**
     * Update order status (admin)
     */
    async updateOrderStatus(orderId, status, adminId, comment = '') {
        const order = await Order.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        // Validate status transition
        const validTransitions = {
            'pending': ['approved', 'rejected', 'cancelled'],
            'approved': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'rejected': [],
            'delivered': [],
            'cancelled': []
        };

        if (!validTransitions[order.status].includes(status)) {
            throw new Error(`Cannot change status from ${order.status} to ${status}`);
        }

        // Update status
        order.status = status;

        // Add to status history
        const historyEntry = {
            status,
            comment,
            updatedBy: adminId,
            updatedAt: new Date()
        };

        order.statusHistory.push(historyEntry);

        // If rejecting, require reason
        if (status === 'rejected') {
            if (!comment) {
                throw new Error('Rejection reason is required');
            }
            order.rejectionReason = comment;
        }

        await order.save();

        return order;
    }

    /**
     * Cancel order (user - only if pending)
     */
    async cancelOrder(orderId, userId) {
        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== 'pending') {
            throw new Error('Only pending orders can be cancelled');
        }

        order.status = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            comment: 'Cancelled by customer',
            updatedAt: new Date()
        });

        await order.save();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        return order;
    }

    /**
     * Get order statistics (admin dashboard)
     */
    async getOrderStats() {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            }
        ]);

        const result = {
            total: 0,
            pending: 0,
            approved: 0,
            shipped: 0,
            delivered: 0,
            rejected: 0,
            cancelled: 0,
            totalRevenue: 0
        };

        stats.forEach(stat => {
            result[stat._id] = stat.count;
            result.total += stat.count;
            if (['approved', 'shipped', 'delivered'].includes(stat._id)) {
                result.totalRevenue += stat.totalRevenue;
            }
        });

        return result;
    }
}

export default new OrderService();
