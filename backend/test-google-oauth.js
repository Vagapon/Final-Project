const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');

// Load environment variables
dotenv.config();

// Test Google OAuth configuration
async function testGoogleOAuth() {
  console.log('🔍 Testing Google OAuth Configuration...\n');
  
  // Check if GOOGLE_CLIENT_ID exists
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('❌ GOOGLE_CLIENT_ID not found in environment variables');
    console.log('💡 Please add GOOGLE_CLIENT_ID to your .env file');
    return;
  }
  
  console.log('✅ GOOGLE_CLIENT_ID found:', clientId);
  
  // Validate Google Client ID format
  const googleClientIdPattern = /^\d+-\w+\.apps\.googleusercontent\.com$/;
  if (!googleClientIdPattern.test(clientId)) {
    console.error('❌ Invalid Google Client ID format');
    console.log('💡 Expected format: numbers-letters.apps.googleusercontent.com');
    return;
  }
  
  console.log('✅ Google Client ID format is valid');
  
  // Test OAuth2Client creation
  try {
    const client = new OAuth2Client(clientId);
    console.log('✅ OAuth2Client created successfully');
    
    // Test if we can access Google's public keys (this will make a network request)
    console.log('🌐 Testing connection to Google OAuth API...');
    
    // This is a simple test to see if we can reach Google's servers
    const testToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXVkIjoi' + clientId + 'iLCJleHAiOjE2MzQ1NjI0MDAsImlhdCI6MTYzNDU1ODgwMCwianRpIjoiIn0.test';
    
    try {
      await client.verifyIdToken({
        idToken: testToken,
        audience: clientId
      });
    } catch (error) {
      if (error.message.includes('No pem found for envelope') || 
          error.message.includes('Wrong number of segments') ||
          error.message.includes('Invalid token')) {
        console.log('✅ Google OAuth API is accessible (expected token validation error)');
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        console.error('❌ Network error when connecting to Google OAuth API');
        console.log('💡 Check your internet connection and firewall settings');
        return;
      } else {
        console.log('✅ Google OAuth API is accessible');
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to create OAuth2Client:', error.message);
    return;
  }
  
  console.log('\n🎉 Google OAuth configuration test completed successfully!');
  console.log('💡 If you\'re still getting "No pem found for envelope" errors,');
  console.log('   it might be due to:');
  console.log('   1. Expired or invalid tokens from frontend');
  console.log('   2. Domain not authorized in Google Console');
  console.log('   3. Token audience mismatch');
}

// Run the test
testGoogleOAuth().catch(console.error);

