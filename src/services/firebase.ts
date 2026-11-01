/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBjwaOJVcYT-dWhzrNmnTzZDUlKAn50YaQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cit-smart-ffc74.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cit-smart-ffc74",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cit-smart-ffc74.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "492197341084",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:492197341084:web:441fda86d4bf15dafa0a59",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZCQ8KCZEKV"
};

// Initialize Firebase App (Singleton check prevents duplicate app initializations)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Firestore instances
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Initialize Analytics safely for browser environment
export let analytics: any = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics is optional or unavailable in certain environments
  });
}

export default app;
