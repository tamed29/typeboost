import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5wYazJQeWTm95Pcv0C24ts59W26olI2w",
    authDomain: "typing-game-be31c.firebaseapp.com",
    projectId: "typing-game-be31c",
    storageBucket: "typing-game-be31c.firebasestorage.app",
    messagingSenderId: "427220138183",
    appId: "1:427220138183:web:2a0ecb1325809145aa66e2",
    measurementId: "G-7CR8Z7Y0W2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
