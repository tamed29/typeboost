import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// In production, use a service account key file via GOOGLE_APPLICATION_CREDENTIALS
// For local development, we'll initialize with env variables or a local json path
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
} else {
    console.warn('⚠️ Firebase Admin not initialized. Provide FIREBASE_SERVICE_ACCOUNT_KEY in .env');
}

export const db = admin.firestore?.();
export const auth = admin.auth?.();
export default admin;
