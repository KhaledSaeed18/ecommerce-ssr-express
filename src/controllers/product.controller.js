import productService from '../services/product.service.js';
import categoryService from '../services/category.service.js';
import { uploadToUploadThing, deleteFile, deleteFiles, getFileKeyFromUrl } from '../config/upload.js';

class ProductController {
    /**
     * GET /admin/products
     * List all products (admin)
     */
    async listProducts(req, res) {
        try {
            const { page = 1, category, search } = req.query;

            const result = await productService.getAllProducts({
                page,
                limit: 20,
                category,
                search,
                sort: '-createdAt'
            });

            const categories = await categoryService.getAllCategories(true);

            res.render('admin/products/list', {
                layout: 'layouts/admin',
                title: 'Manage Products',
                currentPage: 'products',
                ...result,
                categories,
                currentCategory: category || '',
                searchQuery: search || '',
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('List products error:', error);
            res.status(500).send('Error loading products');
        }
    }

    /**
     * GET /admin/products/new
     * Show create product form
     */
    async showCreateForm(req, res) {
        try {
            const categories = await categoryService.getAllCategories(true);

            res.render('admin/products/form', {
                layout: 'layouts/admin',
                title: 'Create Product',
                currentPage: 'products',
                product: null,
                categories,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Show create form error:', error);
            res.status(500).send('Error loading form');
        }
    }

    /**
     * POST /admin/products
     * Create new product
     */
    async createProduct(req, res) {
        try {
            const {
                name,
                description,
                price,
                comparePrice,
                category,
                stock,
                sku,
                isActive,
                isFeatured
            } = req.body;

            // Handle uploaded images
            const images = [];
            if (req.files && req.files.length > 0) {
                const uploadedFiles = await uploadToUploadThing(req.files);
                uploadedFiles.forEach(file => {
                    images.push({
                        url: file.url,
                        alt: name
                    });
                });
            }

            const productData = {
                name,
                description,
                price: parseFloat(price),
                category,
                stock: parseInt(stock) || 0,
                isActive: isActive === 'on',
                isFeatured: isFeatured === 'on',
                images
            };

            if (comparePrice) {
                productData.comparePrice = parseFloat(comparePrice);
            }

            await productService.createProduct(productData);
            res.redirect('/admin/products?success=Product created successfully');
        } catch (error) {
            console.error('Create product error:', error);

            // No need to clean up files - UploadThing handles cleanup automatically
            // Files are only persisted after onUploadComplete callback

            const categories = await categoryService.getAllCategories(true);
            res.render('admin/products/form', {
                layout: 'layouts/admin',
                title: 'Create Product',
                currentPage: 'products',
                product: null,
                categories,
                error: error.message,
                csrfToken: req.csrfToken()
            });
        }
    }

    /**
     * GET /admin/products/:id/edit
     * Show edit product form
     */
    async showEditForm(req, res) {
        try {
            const product = await productService.getProductById(req.params.id);

            if (!product) {
                return res.status(404).send('Product not found');
            }

            const categories = await categoryService.getAllCategories(true);

            res.render('admin/products/form', {
                layout: 'layouts/admin',
                title: 'Edit Product',
                currentPage: 'products',
                product,
                categories,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Show edit form error:', error);
            res.status(500).send('Error loading product');
        }
    }

    /**
     * POST /admin/products/:id
     * Update product
     */
    async updateProduct(req, res) {
        try {
            const {
                name,
                description,
                price,
                comparePrice,
                category,
                stock,
                sku,
                isActive,
                isFeatured
            } = req.body;

            const updateData = {
                name,
                description,
                price: parseFloat(price),
                category,
                stock: parseInt(stock) || 0,
                isActive: isActive === 'on',
                isFeatured: isFeatured === 'on'
            };

            if (comparePrice) {
                updateData.comparePrice = parseFloat(comparePrice);
            }

            // Handle new images
            if (req.files && req.files.length > 0) {
                const product = await productService.getProductById(req.params.id);
                const uploadedFiles = await uploadToUploadThing(req.files);
                const newImages = uploadedFiles.map(file => ({
                    url: file.url,
                    alt: name
                }));
                updateData.images = [...product.images, ...newImages];
            }

            await productService.updateProduct(req.params.id, updateData);
            res.redirect('/admin/products?success=Product updated successfully');
        } catch (error) {
            console.error('Update product error:', error);

            // No need to clean up files - UploadThing handles cleanup automatically

            const product = await productService.getProductById(req.params.id);
            const categories = await categoryService.getAllCategories(true);
            res.render('admin/products/form', {
                layout: 'layouts/admin',
                title: 'Edit Product',
                currentPage: 'products',
                product,
                categories,
                error: error.message,
                csrfToken: req.csrfToken()
            });
        }
    }

    /**
     * POST /admin/products/:id/delete
     * Delete product
     */
    async deleteProduct(req, res) {
        try {
            const product = await productService.getProductById(req.params.id);

            if (!product) {
                return res.redirect('/admin/products?error=Product not found');
            }

            // Delete product images from UploadThing
            if (product.images && product.images.length > 0) {
                const fileKeys = product.images.map(image => getFileKeyFromUrl(image.url));
                await deleteFiles(fileKeys);
            }

            await productService.deleteProduct(req.params.id);
            res.redirect('/admin/products?success=Product deleted successfully');
        } catch (error) {
            console.error('Delete product error:', error);
            res.redirect('/admin/products?error=Error deleting product');
        }
    }

    /**
     * POST /admin/products/:id/images/:index/delete
     * Delete product image
     */
    async deleteImage(req, res) {
        try {
            const product = await productService.getProductById(req.params.id);
            const imageIndex = parseInt(req.params.index);

            if (product && product.images[imageIndex]) {
                const fileKey = getFileKeyFromUrl(product.images[imageIndex].url);
                await deleteFile(fileKey);
                await productService.removeImage(req.params.id, imageIndex);
            }

            res.redirect(`/admin/products/${req.params.id}/edit?success=Image deleted`);
        } catch (error) {
            console.error('Delete image error:', error);
            res.redirect(`/admin/products/${req.params.id}/edit?error=Error deleting image`);
        }
    }

    /**
     * POST /admin/products/:id/toggle
     * Toggle product active status
     */
    async toggleStatus(req, res) {
        try {
            await productService.toggleActiveStatus(req.params.id);
            res.redirect('/admin/products?success=Product status updated');
        } catch (error) {
            console.error('Toggle status error:', error);
            res.redirect('/admin/products?error=Error updating product status');
        }
    }

    /**
     * POST /admin/products/:id/toggle-featured
     * Toggle product featured status
     */
    async toggleFeatured(req, res) {
        try {
            await productService.toggleFeaturedStatus(req.params.id);
            res.redirect('/admin/products?success=Product featured status updated');
        } catch (error) {
            console.error('Toggle featured error:', error);
            res.redirect('/admin/products?error=Error updating featured status');
        }
    }
}

export default new ProductController();
