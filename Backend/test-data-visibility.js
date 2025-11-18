/**
 * Test script to check if scraped data is visible in the API endpoints
 */

const axios = require('axios');

async function testScrapedDataVisibility() {
  console.log('🔍 Testing Scraped Data Visibility in API Endpoints...\n');

  try {
    // First, let's check if we can find the scraped faculty record
    console.log('1. Testing database query for scraped faculty...');

    const mongoose = require('mongoose');
    const Professor = require('./Professor');
    require('dotenv').config();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the faculty record we just created
    const faculty = await Professor.findOne({ node_id: '941' });

    if (faculty) {
      console.log('✅ Found scraped faculty record:');
      console.log(`   Name: ${faculty.name}`);
      console.log(`   Email: ${faculty.email}`);
      console.log(`   Department: ${faculty.department}`);
      console.log(`   Data Source: ${faculty.data_source}`);
      console.log(`   Node ID: ${faculty.node_id}`);
      console.log(`   Record ID: ${faculty._id}`);

      // Check experience data
      console.log('\n📊 Experience Data Check:');
      console.log(`   Teaching Experience: ${faculty.teaching_experience?.length || 0} records`);
      console.log(`   Research Experience: ${faculty.research_experience?.length || 0} records`);
      console.log(`   Industry Experience: ${faculty.industry_experience?.length || 0} records`);

      if (faculty.teaching_experience && faculty.teaching_experience.length > 0) {
        console.log('\n📝 Sample Teaching Experience:');
        const sample = faculty.teaching_experience[0];
        console.log(`   Designation: ${sample.designation}`);
        console.log(`   Institution: ${sample.institution}`);
        console.log(`   Department: ${sample.department}`);
        console.log(`   From: ${sample.from}`);
        console.log(`   To: ${sample.to}`);
      }

      // Check other data sections
      console.log('\n📚 Other Data Sections:');
      console.log(`   Education: ${faculty.education?.length || 0} records`);
      console.log(`   UGC Papers: ${faculty.ugc_approved_journals?.length || 0} records`);
      console.log(`   Books: ${faculty.books?.length || 0} records`);
      console.log(`   Projects: ${faculty.ongoing_projects?.length || 0} ongoing, ${faculty.completed_projects?.length || 0} completed`);
      console.log(`   PhD Guidance: ${faculty.phd_guidance?.length || 0} records`);

      console.log('\n🔑 Login Credentials for Testing:');
      console.log(`   Email: ${faculty.email}`);
      console.log(`   Temporary Password: (check previous test output)`);
      console.log('   You can use these to login and test the frontend pages');

    } else {
      console.log('❌ No scraped faculty record found with Node ID 941');
    }

    await mongoose.disconnect();
    console.log('\n📤 MongoDB disconnected');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testScrapedDataVisibility();