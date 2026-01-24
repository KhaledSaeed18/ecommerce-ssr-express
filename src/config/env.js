import dotenv from 'dotenv';
dotenv.config();

export default {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    COOKIE_SECURE: process.env.NODE_ENV === 'production',
    COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
};
