import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";     

const firebaseConfig = {
  apiKey: "AIzaSyChiWFrgVsN-N436hOUV2x1LI6YL88VbWU",
  authDomain: "sport-event-1505.firebaseapp.com",
  projectId: "sport-event-1505",
  storageBucket: "sport-event-1505.firebasestorage.app",
  messagingSenderId: "852686097163",
  appId: "1:852686097163:web:d9d31e27a4417a11f2700e",
  measurementId: "G-H7MB6JBGHZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Lazy load analytics to improve initial load time
let analytics = null;
export const getAnalyticsInstance = () => {
  if (!analytics) {
    analytics = getAnalytics(app);
  }
  return analytics;
};

export const auth = getAuth(app);

// Configure Google provider for better performance
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Optimized custom parameters for faster login
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'online'
});

console.log("Firebase initialized successfully");
console.log("Firebase config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? "***" + firebaseConfig.apiKey.slice(-4) : "missing"
});