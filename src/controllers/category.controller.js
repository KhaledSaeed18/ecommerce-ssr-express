import categoryService from '../services/category.service.js';

class CategoryController {
    /**
     * GET /admin/categories
     * List all categories (admin)
     */
    async listCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories(true);

            res.render('admin/categories/list', {
                layout: 'layouts/admin',
                title: 'Manage Categories',
                categories,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('List categories error:', error);
            res.status(500).send('Error loading categories');
        }
    }

    /**
     * GET /admin/categories/new
     * Show create category form
     */
    async showCreateForm(req, res) {
        res.render('admin/categories/form', {
            layout: 'layouts/admin',
            title: 'Create Category',
            category: null,
            csrfToken: req.csrfToken()
        });
    }

    /**
     * POST /admin/categories
     * Create new category
     */
    async createCategory(req, res) {
        try {
            const { name, description, isActive } = req.body;

            await categoryService.createCategory({
                name,
                description,
                isActive: isActive === 'on'
            });

            res.redirect('/admin/categories?success=Category created successfully');
        } catch (error) {
            console.error('Create category error:', error);
            res.render('admin/categories/form', {
                layout: 'layouts/admin',
                title: 'Create Category',
                category: null,
                error: error.message,
                csrfToken: req.csrfToken()
            });
        }
    }

    /**
     * GET /admin/categories/:id/edit
     * Show edit category form
     */
    async showEditForm(req, res) {
        try {
            const category = await categoryService.getCategoryById(req.params.id);

            if (!category) {
                return res.status(404).send('Category not found');
            }

            res.render('admin/categories/form', {
                layout: 'layouts/admin',
                title: 'Edit Category',
                category,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Show edit form error:', error);
            res.status(500).send('Error loading category');
        }
    }

    /**
     * POST /admin/categories/:id
     * Update category
     */
    async updateCategory(req, res) {
        try {
            const { name, description, isActive } = req.body;

            const category = await categoryService.updateCategory(req.params.id, {
                name,
                description,
                isActive: isActive === 'on'
            });

            if (!category) {
                return res.status(404).send('Category not found');
            }

            res.redirect('/admin/categories?success=Category updated successfully');
        } catch (error) {
            console.error('Update category error:', error);
            const category = await categoryService.getCategoryById(req.params.id);
            res.render('admin/categories/form', {
                layout: 'layouts/admin',
                title: 'Edit Category',
                category,
                error: error.message,
                csrfToken: req.csrfToken()
            });
        }
    }

    /**
     * POST /admin/categories/:id/delete
     * Delete category
     */
    async deleteCategory(req, res) {
        try {
            // Check if category has products
            const hasProducts = await categoryService.hasProducts(req.params.id);

            if (hasProducts) {
                return res.redirect('/admin/categories?error=Cannot delete category with products');
            }

            await categoryService.deleteCategory(req.params.id);
            res.redirect('/admin/categories?success=Category deleted successfully');
        } catch (error) {
            console.error('Delete category error:', error);
            res.redirect('/admin/categories?error=Error deleting category');
        }
    }

    /**
     * POST /admin/categories/:id/toggle
     * Toggle category active status
     */
    async toggleStatus(req, res) {
        try {
            await categoryService.toggleActiveStatus(req.params.id);
            res.redirect('/admin/categories?success=Category status updated');
        } catch (error) {
            console.error('Toggle status error:', error);
            res.redirect('/admin/categories?error=Error updating category status');
        }
    }
}

export default new CategoryController();
