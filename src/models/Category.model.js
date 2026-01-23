import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        minlength: [2, 'Category name must be at least 2 characters'],
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Helper function to generate slug
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Create slug from name before validation
categorySchema.pre('validate', function () {
    if (this.isModified('name') || !this.slug) {
        this.slug = generateSlug(this.name);
    }
});

// Create slug from name before updating
categorySchema.pre('findOneAndUpdate', function () {
    const update = this.getUpdate();
    if (update.name) {
        update.slug = generateSlug(update.name);
    }
});

// Virtual for products count (will be populated when needed)
categorySchema.virtual('productsCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    count: true
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
