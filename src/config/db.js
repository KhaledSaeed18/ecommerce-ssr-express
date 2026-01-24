import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
    try {
        if (!env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not defined');
        }
        await mongoose.connect(env.DATABASE_URL, {
            serverSelectionTimeoutMS: 8000,
        });

        console.log('MongoDB connected successfully');
        console.log('Database:', mongoose.connection.name);

    } catch (error) {
        if (error.message.includes('querySrv ENOTFOUND')) {
            console.error('Check your DATABASE_URL format');
        } else if (error.message.includes('Authentication failed')) {
            console.error('Check your database username and password');
        } else if (error.message.includes('not authorized')) {
            console.error('Check database user permissions');
        }

        throw error;
    }
};

export default connectDB;
