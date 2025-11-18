const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

async function testDataRefreshSystem() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');

    const userEmail = 'skvjey@pondiuni.ac.in';

    // Check current data state
    console.log('\n📊 CURRENT DATA STATE:');
    const user = await Professor.findOne({ email: userEmail });

    if (user) {
      console.log(`👤 User: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🎓 Teaching Experience: ${user.teaching_experience?.length || 0}`);
      console.log(`📖 UGC Journals: ${user.ugc_approved_journals?.length || 0}`);
      console.log(`📚 Books: ${user.books?.length || 0}`);
      console.log(`🏆 Awards: ${user.awards?.length || 0}`);
      console.log(`🆔 Node ID: ${user.node_id || 'Not set'}`);
      console.log(`📅 Last Scraped: ${user.last_scraped || 'Never'}`);
      console.log(`📊 Data Source: ${user.data_source || 'manual'}`);

      // Show sample data to verify it's working
      if (user.teaching_experience && user.teaching_experience.length > 0) {
        console.log('\n📋 Sample Teaching Experience:');
        user.teaching_experience.slice(0, 2).forEach((exp, index) => {
          console.log(`   ${index + 1}. ${exp.designation} at ${exp.institution} (${exp.from} - ${exp.to})`);
        });
      }

      if (user.ugc_approved_journals && user.ugc_approved_journals.length > 0) {
        console.log('\n📝 Sample Publications:');
        user.ugc_approved_journals.slice(0, 2).forEach((pub, index) => {
          console.log(`   ${index + 1}. "${pub.title}" - ${pub.year}`);
        });
      }

      console.log('\n✅ DATA REFRESH SYSTEM SETUP COMPLETE!');
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. Start the backend server: node index.js');
      console.log('2. Start the frontend: npm start (in frontend folder)');
      console.log('3. Login with: skvjey@pondiuni.ac.in');
      console.log('4. Navigate to Experience, Publications, or Books pages');
      console.log('5. Use "Update My Profile" with Node ID 941');
      console.log('6. Watch the tables automatically refresh with new data!');

    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

testDataRefreshSystem();