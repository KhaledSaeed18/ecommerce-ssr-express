import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

// Connect to database
connectDB();

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
});
