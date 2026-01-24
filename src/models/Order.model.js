import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    image: {
        type: String,
        default: ''
    }
}, {
    _id: false
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalItems: {
        type: Number,
        required: true,
        min: [1, 'Order must have at least 1 item']
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative']
    },
    shippingAddress: {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        postalCode: {
            type: String,
            required: true,
            trim: true
        }
    },
    paymentMethod: {
        type: String,
        enum: ['COD'],
        default: 'COD',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        comment: {
            type: String
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Add status change to history before updating (only for updates, not initial creation)
orderSchema.pre('save', function () {
    if (this.isModified('status') && !this.isNew) {
        const historyEntry = {
            status: this.status,
            updatedAt: new Date()
        };

        if (this.status === 'rejected' && this.rejectionReason) {
            historyEntry.comment = this.rejectionReason;
        }

        this.statusHistory.push(historyEntry);
    }
});

// Indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
