/**
 * Debug script to identify why scraped data isn't visible on frontend pages
 */

const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

async function debugScrapedDataVisibility() {
  console.log('🔍 DEBUG: Investigating Scraped Data Visibility Issues...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Check if scraped faculty record exists
    console.log('\n1️⃣ Checking scraped faculty record...');
    const scrapedFaculty = await Professor.findOne({ node_id: '941' });

    if (!scrapedFaculty) {
      console.log('❌ ISSUE: No scraped faculty found with Node ID 941');
      console.log('   Solution: Run the Update Database button again for Node ID 941');
      return;
    }

    console.log('✅ Found scraped faculty record:');
    console.log(`   Name: ${scrapedFaculty.name}`);
    console.log(`   Email: ${scrapedFaculty.email}`);
    console.log(`   Database ID: ${scrapedFaculty._id}`);
    console.log(`   Data Source: ${scrapedFaculty.data_source}`);

    // Step 2: Check password and login capability
    console.log('\n2️⃣ Checking login credentials...');
    console.log(`   Email: ${scrapedFaculty.email}`);
    console.log(`   Password Hash exists: ${!!scrapedFaculty.password}`);
    console.log(`   Role: ${scrapedFaculty.role}`);

    // Step 3: Analyze experience data structure
    console.log('\n3️⃣ Analyzing experience data structure...');
    console.log(`   Teaching Experience: ${scrapedFaculty.teaching_experience?.length || 0} records`);
    console.log(`   Research Experience: ${scrapedFaculty.research_experience?.length || 0} records`);
    console.log(`   Industry Experience: ${scrapedFaculty.industry_experience?.length || 0} records`);

    if (scrapedFaculty.teaching_experience?.length > 0) {
      console.log('\n   📝 Sample Teaching Experience:');
      const sample = scrapedFaculty.teaching_experience[0];
      console.log(`      Designation: "${sample.designation}"`);
      console.log(`      Institution: "${sample.institution}"`);
      console.log(`      Department: "${sample.department}"`);
      console.log(`      From: "${sample.from}"`);
      console.log(`      To: "${sample.to}"`);

      // Check for empty fields
      if (!sample.designation && !sample.institution) {
        console.log('   ⚠️  WARNING: Teaching experience fields are mostly empty');
      }
    }

    // Step 4: Check publications data
    console.log('\n4️⃣ Analyzing publications data...');
    console.log(`   UGC Approved Journals: ${scrapedFaculty.ugc_approved_journals?.length || 0} records`);
    console.log(`   Non-UGC Journals: ${scrapedFaculty.non_ugc_journals?.length || 0} records`);
    console.log(`   Conference Proceedings: ${scrapedFaculty.conference_proceedings?.length || 0} records`);

    if (scrapedFaculty.ugc_approved_journals?.length > 0) {
      console.log('\n   📚 Sample UGC Paper:');
      const sample = scrapedFaculty.ugc_approved_journals[0];
      console.log(`      Title: "${sample.title}"`);
      console.log(`      Authors: "${sample.authors}"`);
      console.log(`      Journal: "${sample.journal_name}"`);
      console.log(`      Year: "${sample.year}"`);
    }

    // Step 5: Check other data sections
    console.log('\n5️⃣ Analyzing other data sections...');
    console.log(`   Books: ${scrapedFaculty.books?.length || 0} records`);
    console.log(`   Education: ${scrapedFaculty.education?.length || 0} records`);
    console.log(`   Awards: ${scrapedFaculty.awards?.length || 0} records`);
    console.log(`   Research Interests: ${scrapedFaculty.research_interests?.length || 0} items`);

    // Step 6: Check for potential field mismatches
    console.log('\n6️⃣ Checking for potential frontend/backend field mismatches...');

    // Check if frontend expects different field names
    const frontendExpectedFields = [
      'teaching_experience',
      'research_experience',
      'industry_experience',
      'ugc_approved_journals',
      'non_ugc_journals',
      'books',
      'chapters_in_books',
      'edited_books'
    ];

    frontendExpectedFields.forEach(field => {
      const hasField = scrapedFaculty[field] !== undefined;
      const hasData = hasField && Array.isArray(scrapedFaculty[field]) && scrapedFaculty[field].length > 0;
      console.log(`   ${hasData ? '✅' : hasField ? '⚠️ ' : '❌'} ${field}: ${hasField ? (hasData ? `${scrapedFaculty[field].length} records` : 'Empty array') : 'Missing'}`);
    });

    // Step 7: Compare with manually entered faculty
    console.log('\n7️⃣ Comparing with manually entered faculty records...');
    const manualFaculty = await Professor.findOne({
      data_source: { $ne: 'web_scraping' },
      teaching_experience: { $exists: true, $ne: [] }
    });

    if (manualFaculty) {
      console.log(`   Found manual faculty: ${manualFaculty.name}`);
      console.log(`   Manual teaching experience: ${manualFaculty.teaching_experience?.length || 0} records`);

      if (manualFaculty.teaching_experience?.length > 0) {
        const manualSample = manualFaculty.teaching_experience[0];
        console.log('\n   📝 Manual Teaching Experience Structure:');
        console.log(`      Fields: ${Object.keys(manualSample).join(', ')}`);
      }
    } else {
      console.log('   No manually entered faculty found for comparison');
    }

    // Step 8: Generate debugging recommendations
    console.log('\n8️⃣ DEBUGGING RECOMMENDATIONS:');

    if (!scrapedFaculty.teaching_experience?.length) {
      console.log('   ❌ No teaching experience data found');
      console.log('      → Re-run scraping to ensure data transformation worked');
    } else if (scrapedFaculty.teaching_experience[0]?.designation === '') {
      console.log('   ⚠️  Teaching experience exists but fields are empty');
      console.log('      → Check data transformation logic in dataTransformer.js');
    } else {
      console.log('   ✅ Teaching experience data looks good');
    }

    console.log('\n9️⃣ NEXT STEPS TO DEBUG FRONTEND:');
    console.log('   1. Try logging in with:');
    console.log(`      Email: ${scrapedFaculty.email}`);
    console.log('      Password: PUGA31K2ID (or check original output)');
    console.log('   2. Open browser developer tools');
    console.log('   3. Go to Network tab');
    console.log('   4. Visit http://localhost:3000/experience');
    console.log('   5. Check API calls to /api/professor/experience');
    console.log('   6. Verify response contains data');
    console.log('   7. Check console for JavaScript errors');

    await mongoose.disconnect();
    console.log('\n📤 MongoDB disconnected');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugScrapedDataVisibility();