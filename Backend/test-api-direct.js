const mongoose = require('mongoose');
require('dotenv').config();

async function testDirectAPI() {
  try {
    console.log('🚀 Testing direct API call to update profile...\n');

    // First, let's start the server to test the API
    console.log('💡 Starting backend server...');

    // Import and start server
    const app = require('./index'); // This will start the server

    console.log('⏳ Waiting 2 seconds for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDirectAPI();