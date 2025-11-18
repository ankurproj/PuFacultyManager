const axios = require('axios');

async function testScraperEndpoint() {
  try {
    console.log('Testing faculty scraper endpoint...');

    const response = await axios.post('http://localhost:5000/api/scraper/faculty', {
      nodeId: 941
    });

    console.log('Scraper Response Status:', response.status);
    console.log('Scraped Data Structure:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error testing scraper:', error.response?.data || error.message);
  }
}

testScraperEndpoint();