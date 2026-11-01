
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "cit-smart-ffc74.firebaseapp.com",
    projectId: "cit-smart-ffc74",
    storageBucket: "cit-smart-ffc74.firebasestorage.app",
    messagingSenderId: "492197341084",
    appId: "1:492197341084:web:441fda86d4bf15dafa0a59"
};

const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
