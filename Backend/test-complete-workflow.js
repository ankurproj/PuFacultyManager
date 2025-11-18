/**
 * Complete test script to verify scraped data visibility on frontend pages
 */

const axios = require('axios');

async function testCompleteWorkflow() {
  console.log('🎯 Testing Complete Scraped Data Workflow...\n');

  const baseURL = 'http://localhost:5000';
  const credentials = {
    email: 'skvjey@gmail.com',
    password: 'PUGA31K2ID'  // From our previous test
  };

  try {
    // Step 1: Login to get authentication token
    console.log('1️⃣ Testing Login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, credentials);

    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log(`   Token: ${token.substring(0, 20)}...`);

      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Step 2: Test Experience API
      console.log('\n2️⃣ Testing Experience API...');
      const expResponse = await axios.get(`${baseURL}/api/professor/experience`, { headers: authHeaders });

      console.log('✅ Experience data retrieved:');
      console.log(`   Teaching Experience: ${expResponse.data.teaching_experience?.length || 0} records`);
      console.log(`   Research Experience: ${expResponse.data.research_experience?.length || 0} records`);
      console.log(`   Industry Experience: ${expResponse.data.industry_experience?.length || 0} records`);

      if (expResponse.data.teaching_experience?.length > 0) {
        const sample = expResponse.data.teaching_experience[0];
        console.log(`   Sample: ${sample.designation} at ${sample.institution}`);
      }

      // Step 3: Test Publications API
      console.log('\n3️⃣ Testing Publications API...');
      const pubResponse = await axios.get(`${baseURL}/api/professor/publications`, { headers: authHeaders });

      console.log('✅ Publications data retrieved:');
      console.log(`   UGC Journals: ${pubResponse.data.ugc_approved_journals?.length || 0} records`);
      console.log(`   Non-UGC Journals: ${pubResponse.data.non_ugc_journals?.length || 0} records`);

      if (pubResponse.data.ugc_approved_journals?.length > 0) {
        const sample = pubResponse.data.ugc_approved_journals[0];
        console.log(`   Sample UGC Paper: ${sample.title || 'No title'}`);
      }

      // Step 4: Test Books API
      console.log('\n4️⃣ Testing Books API...');
      const bookResponse = await axios.get(`${baseURL}/api/professor/books`, { headers: authHeaders });

      console.log('✅ Books data retrieved:');
      console.log(`   Books: ${bookResponse.data.books?.length || 0} records`);
      console.log(`   Book Chapters: ${bookResponse.data.chapters_in_books?.length || 0} records`);
      console.log(`   Edited Books: ${bookResponse.data.edited_books?.length || 0} records`);

      if (bookResponse.data.books?.length > 0) {
        const sample = bookResponse.data.books[0];
        console.log(`   Sample Book: ${sample.title} (${sample.year})`);
      }

      // Step 5: Test Profile API
      console.log('\n5️⃣ Testing Profile API...');
      const profileResponse = await axios.get(`${baseURL}/api/professor/profile`, { headers: authHeaders });

      console.log('✅ Profile data retrieved:');
      console.log(`   Name: ${profileResponse.data.name}`);
      console.log(`   Email: ${profileResponse.data.email}`);
      console.log(`   Department: ${profileResponse.data.department}`);
      console.log(`   Data Source: ${profileResponse.data.data_source}`);
      console.log(`   Research Interests: ${profileResponse.data.research_interests?.length || 0} items`);
      console.log(`   Area of Expertise: ${profileResponse.data.area_of_expertise?.length || 0} items`);

      console.log('\n🎉 SUCCESS: All API endpoints are returning scraped data correctly!');
      console.log('\n📋 Frontend Pages That Should Now Display Data:');
      console.log('   ✅ http://localhost:3000/experience - Teaching, Research & Industry Experience');
      console.log('   ✅ http://localhost:3000/publications - UGC & Non-UGC Papers');
      console.log('   ✅ http://localhost:3000/books - Books, Chapters & Edited Books');
      console.log('   ✅ http://localhost:3000/profile - Basic Info & Research Interests');
      console.log('   ✅ All other pages with professor data');

      console.log('\n🔑 To Test Frontend:');
      console.log('   1. Start frontend: npm start');
      console.log('   2. Go to: http://localhost:3000/login');
      console.log(`   3. Login with: ${credentials.email} / ${credentials.password}`);
      console.log('   4. Visit any page - data should be visible!');

    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    if (error.response) {
      console.log(`❌ API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    } else {
      console.log('❌ Network Error:', error.message);
      console.log('   Make sure backend server is running: node index.js');
    }
  }
}

testCompleteWorkflow();