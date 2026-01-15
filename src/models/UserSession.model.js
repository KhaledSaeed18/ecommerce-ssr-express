import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sessionId: {
            type: String,
            required: true,
            unique: true,
        },
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
        device: {
            browser: String,
            os: String,
        },
        location: {
            country: String,
            city: String,
        },
        lastSeenAt: {
            type: Date,
            default: Date.now,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
userSessionSchema.index({ userId: 1, isRevoked: 1 });

export default mongoose.model('UserSession', userSessionSchema);
