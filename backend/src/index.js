import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import scoreRoutes from './routes/scoreRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import './config/firebaseClient.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/scores', scoreRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'TypeBoost API Node v4.2.1 Operational' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`❌ SERVER ERROR: ${err.stack}`);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'A system error occurred' : err.message
    });
});

// Handle Unhandled Rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    // Graceful shutdown on critical error
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Deployment Environment: ${process.env.NODE_ENV || 'development'}`);
});
