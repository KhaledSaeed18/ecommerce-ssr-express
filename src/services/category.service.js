import Category from '../models/Category.model.js';

class CategoryService {
    /**
     * Get all categories
     */
    async getAllCategories(includeInactive = false) {
        const filter = includeInactive ? {} : { isActive: true };
        return await Category.find(filter).sort({ name: 1 });
    }

    /**
     * Get category by ID
     */
    async getCategoryById(categoryId) {
        return await Category.findById(categoryId);
    }

    /**
     * Get category by slug
     */
    async getCategoryBySlug(slug) {
        return await Category.findOne({ slug, isActive: true });
    }

    /**
     * Create a new category
     */
    async createCategory(categoryData) {
        const category = new Category(categoryData);
        return await category.save();
    }

    /**
     * Update category
     */
    async updateCategory(categoryId, updateData) {
        return await Category.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true, runValidators: true }
        );
    }

    /**
     * Delete category
     */
    async deleteCategory(categoryId) {
        return await Category.findByIdAndDelete(categoryId);
    }

    /**
     * Toggle category active status
     */
    async toggleActiveStatus(categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        category.isActive = !category.isActive;
        return await category.save();
    }

    /**
     * Check if category has products
     */
    async hasProducts(categoryId) {
        const Product = (await import('../models/Product.model.js')).default;
        const count = await Product.countDocuments({ category: categoryId });
        return count > 0;
    }
}

export default new CategoryService();
