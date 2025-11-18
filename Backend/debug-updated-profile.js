const mongoose = require('mongoose');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function debugUpdatedProfile() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 DEBUGGING UPDATED PROFILE DATA');
    console.log('='.repeat(50));

    // Find all users and their data
    const allUsers = await Professor.find({});
    console.log(`\n📊 Total users: ${allUsers.length}`);

    const userWithMostData = allUsers.reduce((prev, current) => {
      const prevCount = (prev.teaching_experience?.length || 0) + (prev.ugc_papers?.length || 0);
      const currentCount = (current.teaching_experience?.length || 0) + (current.ugc_papers?.length || 0);
      return currentCount > prevCount ? current : prev;
    });

    if (userWithMostData && ((userWithMostData.teaching_experience?.length || 0) > 0)) {
      console.log('\n👤 User with scraped data:');
      console.log(`   Name: ${userWithMostData.name}`);
      console.log(`   Email: ${userWithMostData.email}`);
      console.log(`   User ID: ${userWithMostData._id}`);
      console.log(`   Node ID: ${userWithMostData.node_id || 'Not set'}`);
      console.log(`   Data Source: ${userWithMostData.data_source || 'Not set'}`);

      // Check all possible experience fields
      console.log('\n📚 Experience Data:');
      console.log(`   teaching_experience: ${userWithMostData.teaching_experience?.length || 0}`);
      console.log(`   research_experience: ${userWithMostData.research_experience?.length || 0}`);
      console.log(`   industry_experience: ${userWithMostData.industry_experience?.length || 0}`);

      // Check all possible publication fields
      console.log('\n📄 Publications Data:');
      console.log(`   ugc_papers: ${userWithMostData.ugc_papers?.length || 0}`);
      console.log(`   ugc_approved_journals: ${userWithMostData.ugc_approved_journals?.length || 0}`);
      console.log(`   non_ugc_papers: ${userWithMostData.non_ugc_papers?.length || 0}`);
      console.log(`   non_ugc_journals: ${userWithMostData.non_ugc_journals?.length || 0}`);
      console.log(`   conference_proceedings: ${userWithMostData.conference_proceedings?.length || 0}`);

      // Check books data
      console.log('\n📖 Books Data:');
      console.log(`   books: ${userWithMostData.books?.length || 0}`);
      console.log(`   edited_books: ${userWithMostData.edited_books?.length || 0}`);
      console.log(`   chapters_in_books: ${userWithMostData.chapters_in_books?.length || 0}`);

      // Show sample data
      if (userWithMostData.teaching_experience?.length > 0) {
        console.log('\n📝 Sample Teaching Experience:');
        const sample = userWithMostData.teaching_experience[0];
        console.log(`   Designation: ${sample.designation}`);
        console.log(`   Institution: ${sample.institution}`);
        console.log(`   Department: ${sample.department}`);
        console.log(`   Period: ${sample.from} - ${sample.to}`);
      }

      if (userWithMostData.ugc_approved_journals?.length > 0) {
        console.log('\n📄 Sample UGC Publication:');
        const sample = userWithMostData.ugc_approved_journals[0];
        console.log(`   Title: ${sample.title}`);
        console.log(`   Journal: ${sample.journal_name}`);
        console.log(`   Year: ${sample.year}`);
      }

      // Show what API response should look like
      console.log('\n🔗 EXPECTED API RESPONSES:');
      console.log('\n   GET /api/professor/experience should return:');
      console.log(`   {`);
      console.log(`     teaching_experience: [${userWithMostData.teaching_experience?.length || 0} items],`);
      console.log(`     research_experience: [${userWithMostData.research_experience?.length || 0} items],`);
      console.log(`     industry_experience: [${userWithMostData.industry_experience?.length || 0} items]`);
      console.log(`   }`);

      console.log('\n   GET /api/professor/publications should return:');
      console.log(`   {`);
      console.log(`     ugcPapers: [${userWithMostData.ugc_papers?.length || 0} items],`);
      console.log(`     nonUgcPapers: [${userWithMostData.non_ugc_papers?.length || 0} items]`);
      console.log(`   }`);

      console.log('\n🎯 TO DEBUG FRONTEND:');
      console.log(`   1. Login with: ${userWithMostData.email}`);
      console.log('   2. Visit http://localhost:3000/experience');
      console.log('   3. Open DevTools (F12) → Console tab');
      console.log('   4. Look for debug messages starting with 🔍');
      console.log('   5. Check if data is received but not displayed');

    } else {
      console.log('\n❌ No user found with scraped data!');
      console.log('This means the profile update did not actually save the data.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugUpdatedProfile();