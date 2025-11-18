const mongoose = require('mongoose');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function listAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const allUsers = await Professor.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);

    if (allUsers.length > 0) {
      console.log('\n📝 All users:');
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name || 'No Name'}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Email: ${user.email || 'No email'}`);
        console.log(`   Node ID: ${user.node_id || 'No node_id'}`);
        console.log(`   Has Password: ${!!user.password}`);
        console.log(`   Department: ${user.department || 'No department'}`);
        console.log(`   Data Source: ${user.data_source || 'Not specified'}`);

        // Check for scraped data
        const hasScrapedData = !!(user.teaching_experience?.length ||
                                 user.ugc_approved_journals?.length ||
                                 user.ugc_papers?.length);
        console.log(`   Has Scraped Data: ${hasScrapedData}`);

        if (hasScrapedData) {
          console.log(`   - Teaching: ${user.teaching_experience?.length || 0}`);
          console.log(`   - UGC Papers: ${(user.ugc_approved_journals?.length || 0) + (user.ugc_papers?.length || 0)}`);
        }
      });
    }

    // Look for any user that looks like our scraped faculty
    console.log('\n🔍 Looking for JAYAKUMAR S.K.V...');
    const jayakumarUsers = await Professor.find({
      $or: [
        { name: /JAYAKUMAR/i },
        { name: /S\.K\.V/i }
      ]
    });

    if (jayakumarUsers.length > 0) {
      console.log(`✅ Found ${jayakumarUsers.length} potential matches:`);
      jayakumarUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (ID: ${user._id})`);
        console.log(`   Node ID: ${user.node_id || 'Not set'}`);
        console.log(`   Teaching Experience: ${user.teaching_experience?.length || 0}`);
      });
    } else {
      console.log('❌ No users found with name containing JAYAKUMAR');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

listAllUsers();