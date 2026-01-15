import bcrypt from 'bcrypt';
import User from '../models/User.model.js';

class AuthService {
    /**
     * Hash a password with bcrypt (salt rounds >= 12)
     */
    async hashPassword(password) {
        return await bcrypt.hash(password, 12);
    }

    /**
     * Compare password with hash
     */
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Register a new user
     */
    async register(email, password) {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Create user
        const user = await User.create({
            email,
            passwordHash,
            role: 'user',
            status: 'active',
        });

        return user;
    }

    /**
     * Login - validate credentials
     */
    async login(email, password) {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check if user is active
        if (user.status !== 'active') {
            throw new Error('Account is disabled');
        }

        // Compare password
        const isValid = await this.comparePassword(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        return user;
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        return await User.findById(userId);
    }

    /**
     * Update password
     */
    async updatePassword(userId, newPassword) {
        const passwordHash = await this.hashPassword(newPassword);

        await User.findByIdAndUpdate(userId, {
            passwordHash,
            passwordChangedAt: new Date(),
        });
    }
}

export default new AuthService();
