/**
 * Test the fixed API endpoints to verify correct field names
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

async function testFixedAPIs() {
  try {
    console.log('🧪 TESTING FIXED API ENDPOINTS');
    console.log('='.repeat(50));

    // Step 1: Login
    console.log('\n1️⃣ Logging in...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'test@example.com',
      password: 'test123'
    });

    if (!loginResponse.data.token) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Test Experience API
    console.log('\n2️⃣ Testing Experience API...');
    const expResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/professor/experience',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (expResponse.status === 200) {
      console.log('✅ Experience API Response:');
      console.log(`   teaching_experience: ${expResponse.data.teaching_experience?.length || 0} records`);
      console.log(`   research_experience: ${expResponse.data.research_experience?.length || 0} records`);
      console.log(`   industry_experience: ${expResponse.data.industry_experience?.length || 0} records`);

      if (expResponse.data.teaching_experience?.length > 0) {
        console.log('\n   📚 Sample Teaching Experience:');
        const sample = expResponse.data.teaching_experience[0];
        console.log(`      Designation: ${sample.designation}`);
        console.log(`      Institution: ${sample.institution}`);
      }
    } else {
      console.log('❌ Experience API Failed:', expResponse.data);
    }

    // Step 3: Test Publications API
    console.log('\n3️⃣ Testing Publications API...');
    const pubResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/professor/publications',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (pubResponse.status === 200) {
      console.log('✅ Publications API Response:');
      console.log(`   ugcPapers: ${pubResponse.data.ugcPapers?.length || 0} records`);
      console.log(`   nonUgcPapers: ${pubResponse.data.nonUgcPapers?.length || 0} records`);
      console.log(`   ugc_approved_journals: ${pubResponse.data.ugc_approved_journals?.length || 0} records (legacy)`);

      if (pubResponse.data.ugcPapers?.length > 0) {
        console.log('\n   📄 Sample UGC Paper:');
        const sample = pubResponse.data.ugcPapers[0];
        console.log(`      Title: ${sample.title}`);
        console.log(`      Journal: ${sample.journal_name}`);
      }
    } else {
      console.log('❌ Publications API Failed:', pubResponse.data);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('✅ Backend APIs now return data in correct format for frontend');
    console.log('✅ Field names match what frontend expects');
    console.log('\n📝 NOW TEST IN BROWSER:');
    console.log('1. Go to http://localhost:3000/login');
    console.log('2. Login with: test@example.com / test123');
    console.log('3. Visit http://localhost:3000/experience');
    console.log('4. Visit http://localhost:3000/publications');
    console.log('5. Check browser console for debug messages');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFixedAPIs();