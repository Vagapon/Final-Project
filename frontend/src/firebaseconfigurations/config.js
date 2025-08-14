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
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
console.log("data getting received",auth);
export const googleProvider = new GoogleAuthProvider();