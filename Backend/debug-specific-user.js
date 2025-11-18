const mongoose = require('mongoose');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function debugSpecificUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 DEBUGGING SPECIFIC USER: skvjey@pondiuni.ac.in');
    console.log('='.repeat(60));

    // Find the specific user
    const user = await Professor.findOne({ email: 'skvjey@pondiuni.ac.in' });

    if (!user) {
      console.log('❌ User NOT FOUND with email: skvjey@pondiuni.ac.in');

      // Show all users to see what emails exist
      const allUsers = await Professor.find({});
      console.log(`\n📊 All users in database (${allUsers.length} total):`);
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.name || 'No Name'} - ${u.email || 'No Email'}`);
      });
      return;
    }

    console.log('✅ User FOUND!');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   Node ID: ${user.node_id || 'Not set'}`);
    console.log(`   Data Source: ${user.data_source || 'Not set'}`);
    console.log(`   Last Scraped: ${user.last_scraped || 'Never'}`);

    // Check all data fields thoroughly
    console.log('\n📚 EXPERIENCE DATA:');
    console.log(`   teaching_experience: ${user.teaching_experience?.length || 0} records`);
    console.log(`   research_experience: ${user.research_experience?.length || 0} records`);
    console.log(`   industry_experience: ${user.industry_experience?.length || 0} records`);

    console.log('\n📄 PUBLICATIONS DATA:');
    console.log(`   ugc_papers: ${user.ugc_papers?.length || 0} records`);
    console.log(`   ugc_approved_journals: ${user.ugc_approved_journals?.length || 0} records`);
    console.log(`   non_ugc_papers: ${user.non_ugc_papers?.length || 0} records`);
    console.log(`   non_ugc_journals: ${user.non_ugc_journals?.length || 0} records`);
    console.log(`   conference_proceedings: ${user.conference_proceedings?.length || 0} records`);

    console.log('\n📖 BOOKS DATA:');
    console.log(`   books: ${user.books?.length || 0} records`);
    console.log(`   edited_books: ${user.edited_books?.length || 0} records`);
    console.log(`   chapters_in_books: ${user.chapters_in_books?.length || 0} records`);

    console.log('\n🔍 OTHER SCRAPED FIELDS:');
    console.log(`   education: ${user.education?.length || 0} records`);
    console.log(`   awards: ${user.awards?.length || 0} records`);
    console.log(`   patents: ${user.patents?.length || 0} records`);
    console.log(`   area_of_expertise: ${user.area_of_expertise?.length || 0} records`);

    // Calculate total data
    const totalData = (user.teaching_experience?.length || 0) +
                     (user.ugc_papers?.length || 0) +
                     (user.ugc_approved_journals?.length || 0) +
                     (user.books?.length || 0);

    console.log(`\n📊 TOTAL DATA RECORDS: ${totalData}`);

    if (totalData === 0) {
      console.log('\n❌ NO SCRAPED DATA FOUND FOR THIS USER!');
      console.log('\n🔍 POSSIBLE REASONS:');
      console.log('   1. Profile update failed silently');
      console.log('   2. Data was saved to wrong user');
      console.log('   3. Database connection issue during update');
      console.log('   4. Authentication problem during update');

      console.log('\n💡 SOLUTIONS:');
      console.log('   1. Try running "Update My Profile" again');
      console.log('   2. Check browser console for errors during update');
      console.log('   3. Make sure backend is running during update');

    } else {
      console.log('\n✅ USER HAS SCRAPED DATA!');

      // Show sample data
      if (user.teaching_experience?.length > 0) {
        console.log('\n📚 Sample Teaching Experience:');
        const sample = user.teaching_experience[0];
        console.log(`   Designation: ${sample.designation}`);
        console.log(`   Institution: ${sample.institution}`);
        console.log(`   Department: ${sample.department}`);
        console.log(`   Period: ${sample.from} - ${sample.to}`);
      }

      if (user.ugc_papers?.length > 0 || user.ugc_approved_journals?.length > 0) {
        console.log('\n📄 Sample Publication:');
        const sample = user.ugc_papers?.[0] || user.ugc_approved_journals?.[0];
        if (sample) {
          console.log(`   Title: ${sample.title}`);
          console.log(`   Journal: ${sample.journal_name}`);
          console.log(`   Year: ${sample.year}`);
        }
      }

      console.log('\n🎯 DATA EXISTS - FRONTEND PROBLEM!');
      console.log('   The data is in your profile, but frontend is not displaying it.');
      console.log('   This means there is an API or frontend rendering issue.');
    }

    // Show what API should return
    console.log('\n🔗 EXPECTED API RESPONSES FOR YOUR USER:');
    console.log(`   GET /api/professor/experience should return ${user.teaching_experience?.length || 0} teaching records`);
    console.log(`   GET /api/professor/publications should return ${(user.ugc_papers?.length || 0) + (user.ugc_approved_journals?.length || 0)} publication records`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugSpecificUser();