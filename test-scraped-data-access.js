const fetch = require('node-fetch');

async function testScrapedDataAccess() {
  try {
    console.log('🔐 Logging in as test faculty user...');

    // Login with the test faculty credentials
    const loginResponse = await fetch('http://localhost:5000/api/professor/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'skvjey@gmail.com',
        password: 'PUGA31K2ID'
      })
    });

    const loginData = await loginResponse.json();

    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful');

    // Test experience endpoint
    console.log('\n📚 Testing experience data access...');
    const experienceResponse = await fetch('http://localhost:5000/api/professor/experience', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const experienceData = await experienceResponse.json();

    if (experienceData.success) {
      console.log(`✅ Experience data retrieved successfully:`);
      console.log(`   - Teaching Experience: ${experienceData.data.teachingExperience?.length || 0} records`);
      console.log(`   - Research Experience: ${experienceData.data.researchExperience?.length || 0} records`);
      console.log(`   - Industry Experience: ${experienceData.data.industryExperience?.length || 0} records`);

      if (experienceData.data.teachingExperience && experienceData.data.teachingExperience.length > 0) {
        console.log('\n📝 Sample teaching experience:');
        const first = experienceData.data.teachingExperience[0];
        console.log(`   Institution: ${first.institution || 'N/A'}`);
        console.log(`   Designation: ${first.designation || 'N/A'}`);
        console.log(`   Period: ${first.from || 'N/A'} - ${first.to || 'N/A'}`);
      }
    } else {
      console.log('❌ Failed to retrieve experience data:', experienceData.message);
    }

    // Test publications endpoint
    console.log('\n📖 Testing publications data access...');
    const publicationsResponse = await fetch('http://localhost:5000/api/professor/publications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const publicationsData = await publicationsResponse.json();

    if (publicationsData.success) {
      console.log(`✅ Publications data retrieved successfully:`);
      console.log(`   - UGC Papers: ${publicationsData.data.ugcPapers?.length || 0} records`);
      console.log(`   - Non-UGC Papers: ${publicationsData.data.nonUgcPapers?.length || 0} records`);

      if (publicationsData.data.ugcPapers && publicationsData.data.ugcPapers.length > 0) {
        console.log('\n📄 Sample UGC paper:');
        const first = publicationsData.data.ugcPapers[0];
        console.log(`   Title: ${first.title || 'N/A'}`);
        console.log(`   Journal: ${first.journalName || 'N/A'}`);
        console.log(`   Year: ${first.year || 'N/A'}`);
      }
    } else {
      console.log('❌ Failed to retrieve publications data:', publicationsData.message);
    }

    console.log('\n🎉 Data access test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testScrapedDataAccess();