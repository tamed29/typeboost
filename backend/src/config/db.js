import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        console.error('❌ CRITICAL: MONGODB_URI is not defined in environment variables.');
        // Don't exit here to allow health checks to run, but log heavily
        return null;
    }

    try {
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // In production, we might want to keep the process alive but in a failed state
        // Render will health-check and restart if the server crashes, but we'll try to handle it gracefully
        return null;
    }
};

export default connectDB;
