// Simple test script to check scraper API
const axios = require('axios');

async function testScraperAPI() {
  const baseUrl = 'http://localhost:5000';

  try {
    console.log('Testing scraper API endpoints...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server root endpoint...');
    const rootResponse = await axios.get(`${baseUrl}/`);
    console.log('✓ Server is running:', rootResponse.data);

    // Test 2: Test scraper test endpoint without auth
    console.log('\n2. Testing scraper test endpoint (no auth)...');
    try {
      const testResponse = await axios.get(`${baseUrl}/api/scraper/test`);
      console.log('✓ Test endpoint response:', testResponse.data);
    } catch (error) {
      console.log('✗ Test endpoint failed (expected without auth):', error.response?.status, error.response?.statusText);
    }

    // Test 3: Test scraper test endpoint with fake auth
    console.log('\n3. Testing scraper test endpoint (with fake auth)...');
    try {
      const testResponse = await axios.get(`${baseUrl}/api/scraper/test`, {
        headers: {
          'Authorization': 'Bearer faketoken'
        }
      });
      console.log('✓ Test endpoint response:', testResponse.data);
    } catch (error) {
      console.log('✗ Test endpoint failed (expected with fake auth):', error.response?.status, error.response?.statusText);
    }

    // Test 4: Test preview endpoint
    console.log('\n4. Testing preview endpoint...');
    try {
      const previewResponse = await axios.get(`${baseUrl}/api/scraper/preview/941`, {
        headers: {
          'Authorization': 'Bearer faketoken'
        }
      });
      console.log('✓ Preview endpoint response:', previewResponse.data);
    } catch (error) {
      console.log('✗ Preview endpoint failed:', error.response?.status, error.response?.statusText);
      if (error.response?.data) {
        console.log('Error data:', error.response.data);
      }
    }

  } catch (error) {
    console.error('Error testing scraper API:', error.message);
  }
}

testScraperAPI();