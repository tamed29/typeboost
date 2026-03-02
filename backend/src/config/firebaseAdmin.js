import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize Firebase Admin for production-grade security.
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY in environment.
 */
const initializeFirebase = () => {
    try {
        const saKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (!saKey) {
            console.warn('⚠️  WARNING: FIREBASE_SERVICE_ACCOUNT_KEY missing. Admin operations disabled.');
            return null;
        }

        const serviceAccount = JSON.parse(saKey);

        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error(`❌ CRITICAL: Failed to parse Firebase Service Account: ${error.message}`);
        return null;
    }
};

const app = initializeFirebase();

export const db = app ? admin.firestore() : null;
export const auth = app ? admin.auth() : null;
export default admin;
