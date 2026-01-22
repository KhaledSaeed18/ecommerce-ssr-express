import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';

class ProductService {
    /**
     * Get all products with optional filtering
     */
    async getAllProducts(options = {}) {
        const {
            category,
            isActive,
            isFeatured,
            search,
            minPrice,
            maxPrice,
            page = 1,
            limit = 12,
            sort = '-createdAt'
        } = options;

        const filter = {};

        if (category) filter.category = category;
        if (typeof isActive !== 'undefined') filter.isActive = isActive;
        if (typeof isFeatured !== 'undefined') filter.isFeatured = isFeatured;

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category', 'name slug')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter)
        ]);

        return {
            products,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get product by ID
     */
    async getProductById(productId) {
        return await Product.findById(productId).populate('category', 'name slug');
    }

    /**
     * Get product by slug
     */
    async getProductBySlug(slug) {
        return await Product.findOne({ slug, isActive: true })
            .populate('category', 'name slug');
    }

    /**
     * Create a new product
     */
    async createProduct(productData) {
        // Verify category exists
        const category = await Category.findById(productData.category);
        if (!category) {
            throw new Error('Category not found');
        }

        const product = new Product(productData);
        return await product.save();
    }

    /**
     * Update product
     */
    async updateProduct(productId, updateData) {
        // If category is being updated, verify it exists
        if (updateData.category) {
            const category = await Category.findById(updateData.category);
            if (!category) {
                throw new Error('Category not found');
            }
        }

        return await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name slug');
    }

    /**
     * Delete product
     */
    async deleteProduct(productId) {
        return await Product.findByIdAndDelete(productId);
    }

    /**
     * Toggle product active status
     */
    async toggleActiveStatus(productId) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        product.isActive = !product.isActive;
        return await product.save();
    }

    /**
     * Toggle product featured status
     */
    async toggleFeaturedStatus(productId) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        product.isFeatured = !product.isFeatured;
        return await product.save();
    }

    /**
     * Get featured products
     */
    async getFeaturedProducts(limit = 8) {
        return await Product.find({ isActive: true, isFeatured: true })
            .populate('category', 'name slug')
            .sort('-createdAt')
            .limit(limit);
    }

    /**
     * Add image to product
     */
    async addImage(productId, imageData) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        product.images.push(imageData);
        return await product.save();
    }

    /**
     * Remove image from product
     */
    async removeImage(productId, imageIndex) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (imageIndex >= 0 && imageIndex < product.images.length) {
            product.images.splice(imageIndex, 1);
            return await product.save();
        }
        throw new Error('Invalid image index');
    }
}

export default new ProductService();
