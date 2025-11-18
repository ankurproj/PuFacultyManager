/**
 * Complete Frontend-Backend Integration Test
 * This simulates the exact process that happens when you login and visit pages
 */

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
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

async function testFullIntegration() {
  try {
    console.log('🔍 TESTING COMPLETE FRONTEND-BACKEND INTEGRATION');
    console.log('='.repeat(60));

    // Step 1: Test if backend is running
    console.log('\n1️⃣ Testing if backend is running...');
    try {
      const healthCheck = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/',
        method: 'GET'
      });

      if (healthCheck.status === 200) {
        console.log('✅ Backend is running on port 5000');
      } else {
        console.log('⚠️  Backend responded with status:', healthCheck.status);
      }
    } catch (error) {
      console.log('❌ Backend is NOT running on port 5000!');
      console.log('   Please start backend: cd Backend && node index.js');
      return;
    }

    // Step 2: Login with test credentials
    console.log('\n2️⃣ Testing login with test credentials...');
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
      email: 'test@example.com',
      password: 'test123'
    };

    const loginResponse = await makeRequest(loginOptions, loginData);

    if (loginResponse.status !== 200 || !loginResponse.data.token) {
      console.log('❌ Login failed:', loginResponse.data);
      console.log('   Make sure the test user exists and credentials are correct.');
      return;
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data.result._id;
    console.log('✅ Login successful!');
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Step 3: Test experience endpoint
    console.log('\n3️⃣ Testing experience endpoint...');
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

    if (experienceResponse.status === 200) {
      console.log('✅ Experience API working!');
      console.log(`   Teaching Experience: ${experienceResponse.data.teaching_experience?.length || 0} records`);
      console.log(`   Research Experience: ${experienceResponse.data.research_experience?.length || 0} records`);
      console.log(`   Industry Experience: ${experienceResponse.data.industry_experience?.length || 0} records`);

      if (experienceResponse.data.teaching_experience?.length > 0) {
        console.log('\n   📚 Sample Teaching Experience:');
        const sample = experienceResponse.data.teaching_experience[0];
        console.log(`      Designation: ${sample.designation}`);
        console.log(`      Institution: ${sample.institution}`);
        console.log(`      Department: ${sample.department}`);
      } else {
        console.log('   ⚠️  No teaching experience found - this might be why frontend shows empty!');
      }
    } else {
      console.log('❌ Experience API failed:', experienceResponse.data);
    }

    // Step 4: Test publications endpoint
    console.log('\n4️⃣ Testing publications endpoint...');
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

    if (publicationsResponse.status === 200) {
      console.log('✅ Publications API working!');
      console.log(`   UGC Papers: ${publicationsResponse.data.ugcPapers?.length || 0} records`);
      console.log(`   Non-UGC Papers: ${publicationsResponse.data.nonUgcPapers?.length || 0} records`);
    } else {
      console.log('❌ Publications API failed:', publicationsResponse.data);
    }

    // Step 5: Troubleshooting recommendations
    console.log('\n🔧 TROUBLESHOOTING CHECKLIST:');
    console.log('1. ✅ Backend running: YES');
    console.log('2. ✅ Login working: YES');
    console.log('3. ✅ APIs accessible: Check above results');

    console.log('\n📝 TO SEE DATA ON FRONTEND:');
    console.log('1. Go to http://localhost:3000');
    console.log('2. Login with: test@example.com / password123');
    console.log('3. Go to http://localhost:3000/experience');
    console.log('4. Open browser Developer Tools (F12)');
    console.log('5. Check Network tab for API calls');
    console.log('6. Check Console tab for JavaScript errors');

    if (experienceResponse.data.teaching_experience?.length > 0) {
      console.log('\n✅ DATA IS AVAILABLE! If frontend shows empty tables:');
      console.log('   • Check if you\'re logged in as test@example.com');
      console.log('   • Check browser console for JavaScript errors');
      console.log('   • Verify API calls are successful in Network tab');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFullIntegration();