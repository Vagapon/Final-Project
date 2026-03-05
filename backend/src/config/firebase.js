const admin = require("firebase-admin");

if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error("❌ FIREBASE_PRIVATE_KEY is missing. Check your .env file.");
  process.exit(1);
}

// Parse private key from environment variable
let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();

console.log("=== RAW ENV VALUE ===");
console.log("Length:", privateKey.length);
console.log("First 100 chars:", privateKey.substring(0, 100));
console.log("Contains literal \\n:", privateKey.includes('\\n'));
console.log("Contains actual newline:", privateKey.includes('\n'));

// If it's a JSON string, parse it
if (privateKey.startsWith('{')) {
  try {
    const keyObj = JSON.parse(privateKey);
    privateKey = keyObj.private_key;
    console.log("✅ Parsed from JSON");
  } catch (e) {
    console.log("❌ JSON parse failed:", e.message);
  }
}

// Remove outer quotes if they exist
const beforeQuotes = privateKey;
privateKey = privateKey.replace(/^["'](.*)["']$/, '$1');
if (beforeQuotes !== privateKey) {
  console.log("✅ Removed outer quotes");
}

// Convert escaped newlines to actual newlines
const beforeNewline = privateKey;
privateKey = privateKey.replace(/\\n/g, '\n');
console.log("Converted \\n to actual newline:", beforeNewline !== privateKey);

console.log("=== FINAL KEY ===");
console.log("Length:", privateKey.length);
console.log("First 100 chars:", privateKey.substring(0, 100));
console.log("Last 50 chars:", privateKey.substring(privateKey.length - 50));
console.log("Contains actual newlines:", (privateKey.match(/\n/g) || []).length);

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
