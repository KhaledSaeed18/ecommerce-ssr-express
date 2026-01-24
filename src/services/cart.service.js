import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';

const cartService = {
    /**
     * Get user's cart
     * @param {string} userId 
     * @returns {Promise<Object>}
     */
    async getCart(userId) {
        let cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name slug price stock images isActive'
            });

        if (!cart) {
            // Create new cart if doesn't exist
            cart = await Cart.create({ user: userId, items: [] });
            cart = await cart.populate({
                path: 'items.product',
                select: 'name slug price stock images isActive'
            });
        }

        return cart;
    },

    /**
     * Add item to cart
     * @param {string} userId 
     * @param {string} productId 
     * @param {number} quantity 
     * @returns {Promise<Object>}
     */
    async addItem(userId, productId, quantity = 1) {
        // Validate product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (!product.isActive) {
            throw new Error('Product is not available');
        }

        if (product.stock < quantity) {
            throw new Error('Insufficient stock');
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;

            if (product.stock < newQuantity) {
                throw new Error('Insufficient stock');
            }

            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].price = product.price;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price
            });
        }

        await cart.save();

        // Populate and return
        await cart.populate({
            path: 'items.product',
            select: 'name slug price stock images isActive'
        });

        return cart;
    },

    /**
     * Update item quantity
     * @param {string} userId 
     * @param {string} productId 
     * @param {number} quantity 
     * @returns {Promise<Object>}
     */
    async updateItemQuantity(userId, productId, quantity) {
        if (quantity < 1) {
            throw new Error('Quantity must be at least 1');
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            throw new Error('Product not in cart');
        }

        // Check stock availability
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (product.stock < quantity) {
            throw new Error('Insufficient stock');
        }

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = product.price;

        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name slug price stock images isActive'
        });

        return cart;
    },

    /**
     * Remove item from cart
     * @param {string} userId 
     * @param {string} productId 
     * @returns {Promise<Object>}
     */
    async removeItem(userId, productId) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name slug price stock images isActive'
        });

        return cart;
    },

    /**
     * Clear cart
     * @param {string} userId 
     * @returns {Promise<Object>}
     */
    async clearCart(userId) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        cart.items = [];
        await cart.save();

        return cart;
    }
};

export default cartService;
