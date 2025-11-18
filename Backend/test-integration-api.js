/**
 * Debug the integration API endpoint
 */

const axios = require('axios');

async function testIntegrationAPI() {
  console.log('🔍 Testing Integration API...\n');

  try {
    // First, test if the integration endpoint exists
    console.log('1. Testing endpoint availability...');
    const healthCheck = await axios.get('http://localhost:5000');
    console.log('✅ Backend server is running:', healthCheck.data);

    // Test the integration endpoint without auth (should get 401)
    console.log('\n2. Testing integration endpoint without auth...');
    try {
      const response = await axios.post('http://localhost:5000/api/integration/faculty/941');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Integration endpoint exists (returns 401 as expected without auth)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test with a token (if available)
    console.log('\n3. Testing integration endpoint with mock auth...');
    try {
      const response = await axios.post('http://localhost:5000/api/integration/faculty/941', {
        updateStrategy: 'merge'
      }, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('Response status:', error.response?.status);
      console.log('Response data:', error.response?.data);
      console.log('Error message:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testIntegrationAPI();