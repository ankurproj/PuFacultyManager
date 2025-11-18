const mongoose = require('mongoose');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function debugCurrentState() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 DEBUGGING CURRENT DATABASE STATE');
    console.log('='.repeat(50));

    // Check all users in database
    const allUsers = await Professor.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);

    if (allUsers.length === 0) {
      console.log('\n❌ NO USERS FOUND IN DATABASE!');
      console.log('📝 You need to:');
      console.log('   1. Make sure you actually ran "Update My Profile"');
      console.log('   2. Check if there were any errors during the process');
      console.log('   3. Make sure backend is running on port 5000');
      return;
    }

    console.log('\n👥 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   Email: ${user.email || 'No email'}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Data Source: ${user.data_source || 'Not set'}`);
      console.log(`   Teaching Experience: ${user.teaching_experience?.length || 0} records`);
      console.log(`   UGC Papers: ${user.ugc_papers?.length || 0} records`);
      console.log(`   UGC Approved Journals: ${user.ugc_approved_journals?.length || 0} records`);
      console.log(`   Has Password: ${!!user.password}`);

      // Check if this user has any scraped data
      const hasScrapedData = (
        (user.teaching_experience?.length || 0) > 0 ||
        (user.ugc_papers?.length || 0) > 0 ||
        (user.ugc_approved_journals?.length || 0) > 0 ||
        user.data_source === 'web_scraping' ||
        user.data_source === 'hybrid'
      );
      console.log(`   Has Scraped Data: ${hasScrapedData ? '✅ YES' : '❌ NO'}`);
    });

    // Find the user that should have scraped data
    const userWithData = allUsers.find(user =>
      (user.teaching_experience?.length || 0) > 0 ||
      (user.ugc_papers?.length || 0) > 0 ||
      user.data_source === 'hybrid' ||
      user.data_source === 'web_scraping'
    );

    if (userWithData) {
      console.log('\n🎯 USER WITH SCRAPED DATA FOUND:');
      console.log(`   Name: ${userWithData.name}`);
      console.log(`   Email: ${userWithData.email}`);
      console.log(`   Login credentials: ${userWithData.email && userWithData.password ? '✅ Available' : '❌ Missing'}`);

      // Show sample data
      if (userWithData.teaching_experience?.length > 0) {
        console.log('\n📚 Sample Teaching Experience:');
        const sample = userWithData.teaching_experience[0];
        console.log(`   Designation: ${sample.designation}`);
        console.log(`   Institution: ${sample.institution}`);
        console.log(`   Department: ${sample.department}`);
      }

      if (userWithData.ugc_papers?.length > 0) {
        console.log('\n📄 Sample UGC Paper:');
        const sample = userWithData.ugc_papers[0];
        console.log(`   Title: ${sample.title}`);
        console.log(`   Journal: ${sample.journal_name}`);
        console.log(`   Year: ${sample.year}`);
      }

      console.log('\n🔐 TO SEE THIS DATA ON FRONTEND:');
      console.log(`   1. Login with: ${userWithData.email}`);
      console.log('   2. Go to http://localhost:3000/experience');
      console.log('   3. Go to http://localhost:3000/publications');
      console.log('   4. Check browser developer tools for API errors');
    } else {
      console.log('\n❌ NO USER WITH SCRAPED DATA FOUND!');
      console.log('📝 This means the "Update My Profile" process did not work.');
      console.log('   Check the browser console for errors when clicking the button.');
    }

    // Check for the specific test user
    const testUser = allUsers.find(user => user.email === 'test@example.com');
    if (testUser) {
      console.log('\n🧪 TEST USER STATUS:');
      console.log(`   Teaching Experience: ${testUser.teaching_experience?.length || 0} records`);
      console.log(`   Publications: ${testUser.ugc_papers?.length || 0} records`);
      console.log('   You can login with: test@example.com / password123');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugCurrentState();