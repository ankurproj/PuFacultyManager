const mongoose = require('mongoose');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function debugCloudDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas Cloud...');
    console.log(`📡 URI: ${process.env.MONGO_URI.substring(0, 50)}...`);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas Cloud');

    console.log('\n🔍 SEARCHING FOR YOUR USER IN CLOUD DATABASE');
    console.log('='.repeat(60));

    // Search for your user with variations of the email
    const searchEmails = [
      'skvjey@pondiuni.ac.in',
      'skvjey@gmail.com',
      'SKVJEY@PONDIUNI.AC.IN',
      'skvjey@pondiuni.edu.in'
    ];

    let foundUser = null;

    for (const email of searchEmails) {
      console.log(`🔍 Searching for: ${email}`);
      const user = await Professor.findOne({ email: email });
      if (user) {
        foundUser = user;
        console.log(`✅ FOUND USER: ${email}`);
        break;
      } else {
        console.log(`❌ Not found: ${email}`);
      }
    }

    // Also search by name
    console.log('\n🔍 Searching by name variations...');
    const nameSearches = [
      'JAYAKUMAR',
      'S.K.V',
      'SKV',
      'Jayakumar'
    ];

    for (const namePattern of nameSearches) {
      console.log(`🔍 Searching for name containing: ${namePattern}`);
      const users = await Professor.find({ name: { $regex: namePattern, $options: 'i' } });
      if (users.length > 0) {
        console.log(`✅ Found ${users.length} users with name containing "${namePattern}":`);
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} - ${user.email}`);
          if (!foundUser) foundUser = user;
        });
      }
    }

    if (foundUser) {
      console.log('\n🎯 USER FOUND IN CLOUD DATABASE:');
      console.log(`   Name: ${foundUser.name}`);
      console.log(`   Email: ${foundUser.email}`);
      console.log(`   User ID: ${foundUser._id}`);
      console.log(`   Node ID: ${foundUser.node_id || 'Not set'}`);
      console.log(`   Data Source: ${foundUser.data_source || 'Not set'}`);

      // Check data
      console.log('\n📊 CURRENT DATA IN YOUR CLOUD PROFILE:');
      console.log(`   Teaching Experience: ${foundUser.teaching_experience?.length || 0} records`);
      console.log(`   Research Experience: ${foundUser.research_experience?.length || 0} records`);
      console.log(`   UGC Papers: ${foundUser.ugc_papers?.length || 0} records`);
      console.log(`   UGC Approved Journals: ${foundUser.ugc_approved_journals?.length || 0} records`);
      console.log(`   Books: ${foundUser.books?.length || 0} records`);

      const totalRecords = (foundUser.teaching_experience?.length || 0) +
                          (foundUser.ugc_papers?.length || 0) +
                          (foundUser.ugc_approved_journals?.length || 0) +
                          (foundUser.books?.length || 0);

      if (totalRecords === 0) {
        console.log('\n❌ NO SCRAPED DATA FOUND IN YOUR CLOUD PROFILE!');
        console.log('\n💡 SOLUTION:');
        console.log('   1. Make sure backend is running: node index.js');
        console.log('   2. Login with your correct cloud credentials');
        console.log('   3. Go to faculty-importer page');
        console.log('   4. Enter Node ID: 941');
        console.log('   5. Click "Update My Profile" again');
        console.log('   6. Check for any error messages');
      } else {
        console.log('\n✅ YOU HAVE DATA! If tables are empty, it\'s a frontend issue.');
        console.log(`   Total records: ${totalRecords}`);
      }

    } else {
      console.log('\n❌ YOUR USER NOT FOUND IN CLOUD DATABASE!');

      // Show all users in cloud database
      const allUsers = await Professor.find({}).limit(10);
      console.log(`\n📊 All users in cloud database (showing first 10 of ${allUsers.length}):`);
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No Name'} - ${user.email || 'No Email'}`);
      });

      console.log('\n💡 SOLUTIONS:');
      console.log('   1. Create account: Go to http://localhost:3000/signup');
      console.log('   2. Use exact email: skvjey@pondiuni.ac.in');
      console.log('   3. After signup, run "Update My Profile" again');
    }

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('\n🔧 CHECK:');
    console.log('   1. Internet connection');
    console.log('   2. MongoDB Atlas cluster is running');
    console.log('   3. IP address is whitelisted in Atlas');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

debugCloudDatabase();