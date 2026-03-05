const fs = require('fs');
const path = require('path');
require('dotenv').config();

if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error('❌ FIREBASE_PRIVATE_KEY not found in .env');
  process.exit(1);
}

let privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Remove quotes if they exist
privateKey = privateKey.replace(/^["'](.*)["']$/, '$1');

// Convert to base64
const encoded = Buffer.from(privateKey).toString('base64');

console.log('✅ Base64 Encoded Private Key:');
console.log('');
console.log(encoded);
console.log('');
console.log('📋 Copy the above value and paste it into Render environment variable:');
console.log('   FIREBASE_PRIVATE_KEY = <paste above value>');
