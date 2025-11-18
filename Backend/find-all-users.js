const mongoose = require('mongoose');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function findAllCloudUsers() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas Cloud...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas Cloud');

    console.log('\n📊 ALL USERS IN MONGODB ATLAS CLOUD DATABASE');
    console.log('='.repeat(60));

    // Get ALL users (remove limit)
    const allUsers = await Professor.find({});
    console.log(`\n📈 Total users found: ${allUsers.length}`);

    if (allUsers.length === 0) {
      console.log('❌ No users found in the database!');
      return;
    }

    console.log('\n👥 ALL USERS:');
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   📧 Email: ${user.email || 'No Email'}`);
      console.log(`   🆔 User ID: ${user._id}`);
      console.log(`   🏢 Department: ${user.department || 'Not set'}`);
      console.log(`   🔢 Node ID: ${user.node_id || 'Not set'}`);
      console.log(`   📊 Data Source: ${user.data_source || 'Not set'}`);

      // Check if user has any scraped data
      const hasData = (user.teaching_experience?.length || 0) +
                     (user.ugc_papers?.length || 0) +
                     (user.ugc_approved_journals?.length || 0) +
                     (user.books?.length || 0);

      console.log(`   📚 Total Data Records: ${hasData}`);

      if (hasData > 0) {
        console.log(`   ✅ HAS SCRAPED DATA:`);
        console.log(`      - Teaching: ${user.teaching_experience?.length || 0}`);
        console.log(`      - UGC Papers: ${user.ugc_papers?.length || 0}`);
        console.log(`      - UGC Journals: ${user.ugc_approved_journals?.length || 0}`);
        console.log(`      - Books: ${user.books?.length || 0}`);
      } else {
        console.log(`   ❌ No scraped data`);
      }
    });

    // Look specifically for emails containing 'skvjey' or names containing 'jayakumar'
    console.log('\n🔍 SEARCHING FOR YOUR ACCOUNT...');

    const yourPossibleAccounts = allUsers.filter(user =>
      (user.email && user.email.toLowerCase().includes('skvjey')) ||
      (user.name && user.name.toLowerCase().includes('jayakumar')) ||
      (user.email && user.email.toLowerCase().includes('pondiuni')) ||
      (user.node_id === '941')
    );

    if (yourPossibleAccounts.length > 0) {
      console.log('🎯 POSSIBLE MATCHES FOR YOUR ACCOUNT:');
      yourPossibleAccounts.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Has Login Credentials: ${user.email && user.password ? 'YES' : 'NO'}`);
        console.log(`   Node ID: ${user.node_id || 'Not set'}`);

        if (user.teaching_experience?.length > 0) {
          console.log(`   ⭐ This account has ${user.teaching_experience.length} teaching records!`);
        }
      });

      console.log('\n💡 TRY LOGGING IN WITH ONE OF THESE ACCOUNTS');
    } else {
      console.log('❌ No accounts found matching your profile');

      console.log('\n🔧 NEXT STEPS:');
      console.log('1. Check if you have an account with a different email');
      console.log('2. If no account exists, create one at: http://localhost:3000/signup');
      console.log('3. Use email: skvjey@pondiuni.ac.in');
      console.log('4. Then run "Update My Profile" with Node ID 941');
    }

    // Show users with most data (likely the active accounts)
    const usersWithData = allUsers.filter(user => {
      const dataCount = (user.teaching_experience?.length || 0) +
                       (user.ugc_papers?.length || 0) +
                       (user.ugc_approved_journals?.length || 0);
      return dataCount > 0;
    }).sort((a, b) => {
      const aData = (a.teaching_experience?.length || 0) + (a.ugc_papers?.length || 0);
      const bData = (b.teaching_experience?.length || 0) + (b.ugc_papers?.length || 0);
      return bData - aData;
    });

    if (usersWithData.length > 0) {
      console.log('\n📊 USERS WITH SCRAPED DATA (most data first):');
      usersWithData.forEach((user, index) => {
        const dataCount = (user.teaching_experience?.length || 0) +
                         (user.ugc_papers?.length || 0) +
                         (user.ugc_approved_journals?.length || 0);
        console.log(`${index + 1}. ${user.name} (${user.email}) - ${dataCount} records`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

findAllCloudUsers();