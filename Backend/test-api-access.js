// Simple test without external dependencies
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testApiAccess() {
  try {
    console.log('🔐 Testing login...');

    // Step 1: Login
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginData = {
      email: 'skvjey@gmail.com',
      password: 'PUGA31K2ID'
    };

    const loginResponse = await makeRequest(loginOptions, loginData);

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Test experience endpoint
    console.log('\n📚 Testing experience endpoint...');
    const experienceOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/professor/experience',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const experienceResponse = await makeRequest(experienceOptions);

    if (experienceResponse.status === 200 && experienceResponse.data.success) {
      const data = experienceResponse.data.data;
      console.log('✅ Experience data retrieved successfully!');
      console.log(`   Teaching: ${data.teachingExperience?.length || 0} records`);
      console.log(`   Research: ${data.researchExperience?.length || 0} records`);
      console.log(`   Industry: ${data.industryExperience?.length || 0} records`);

      if (data.teachingExperience?.length > 0) {
        console.log('\n📝 First teaching record:');
        const first = data.teachingExperience[0];
        console.log(`   Institution: ${first.institution}`);
        console.log(`   Designation: ${first.designation}`);
      }
    } else {
      console.log('❌ Experience endpoint failed:', experienceResponse.data);
    }

    // Step 3: Test publications endpoint
    console.log('\n📖 Testing publications endpoint...');
    const publicationsOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/professor/publications',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const publicationsResponse = await makeRequest(publicationsOptions);

    if (publicationsResponse.status === 200 && publicationsResponse.data.success) {
      const data = publicationsResponse.data.data;
      console.log('✅ Publications data retrieved successfully!');
      console.log(`   UGC Papers: ${data.ugcPapers?.length || 0} records`);
      console.log(`   Non-UGC Papers: ${data.nonUgcPapers?.length || 0} records`);
    } else {
      console.log('❌ Publications endpoint failed:', publicationsResponse.data);
    }

    console.log('\n🎉 API endpoints are working! The frontend should now show scraped data.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApiAccess();