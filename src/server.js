import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

// Connect to database
connectDB().catch((error) => {
    console.error('Failed to connect to database:', error.message);
    console.error('Server cannot start without database connection');
});

// Start server
const PORT = env.PORT || 10000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});
