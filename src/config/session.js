import session from 'express-session';
import { MongoStore } from 'connect-mongo';
import env from './env.js';

const sessionConfig = {
    name: 'sid',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: MongoStore.create({
        mongoUrl: env.DATABASE_URL,
        touchAfter: 24 * 3600, // Update session once per 24 hours unless data changed
        crypto: {
            secret: env.SESSION_SECRET,
        },
    }),
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.COOKIE_SECURE,
        maxAge: env.COOKIE_MAX_AGE,
    },
};

export default session(sessionConfig);
