const admin = require("firebase-admin");

if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error("❌ FIREBASE_PRIVATE_KEY is missing. Check your .env file.");
  process.exit(1);
}

// Parse private key from environment variable
let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();

// If it's base64 encoded, decode it first
if (!privateKey.startsWith('-----BEGIN')) {
  try {
    privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
    console.log("✅ Decoded from base64");
  } catch (e) {
    console.log("Not base64 format");
  }
}

// If it's a JSON string, parse it
if (privateKey.startsWith('{')) {
  try {
    const keyObj = JSON.parse(privateKey);
    privateKey = keyObj.private_key;
    console.log("✅ Parsed from JSON");
  } catch (e) {
    console.log("❌ JSON parse failed");
  }
}

// Remove outer quotes if they exist
privateKey = privateKey.replace(/^["'](.*)["']$/, '$1');

// Convert escaped newlines to actual newlines
privateKey = privateKey.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

console.log("✅ Firebase Admin initialized");

module.exports = admin;
