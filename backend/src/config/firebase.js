const admin = require("firebase-admin");

if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error("❌ FIREBASE_PRIVATE_KEY is missing. Check your .env file.");
  process.exit(1);
}

// Parse private key from environment variable
let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();

console.log("Private Key Preview:", privateKey.substring(0, 50) + "...");

// If it's a JSON string, parse it
if (privateKey.startsWith('{')) {
  try {
    const keyObj = JSON.parse(privateKey);
    privateKey = keyObj.private_key;
  } catch (e) {
    console.log("Not JSON format, treating as string");
  }
}

// Remove outer quotes if they exist
privateKey = privateKey.replace(/^["'](.*)["']$/, '$1');

// Convert escaped newlines to actual newlines
// Handle both \\n and \n
privateKey = privateKey.replace(/\\n/g, '\n');

console.log("Processed Key Preview:", privateKey.substring(0, 50) + "...");
console.log("Key starts with BEGIN:", privateKey.includes('BEGIN PRIVATE KEY'));

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

console.log("✅ Firebase Admin initialized");

console.log("✅ Firebase Admin initialized");

module.exports = admin;
