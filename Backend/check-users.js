const mongoose = require('mongoose');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with the email skvjey@gmail.com
    const users = await Professor.find({ email: 'skvjey@gmail.com' });
    console.log(`\n📧 Found ${users.length} users with email skvjey@gmail.com`);

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Node ID: ${user.node_id}`);
      console.log(`   Has Password: ${!!user.password}`);
      console.log(`   Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'None'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Data Source: ${user.data_source}`);
    });

    // Try to find any user that might work for login
    console.log('\n🔍 Looking for users with login credentials...');
    const loginUsers = await Professor.find({
      email: { $exists: true, $ne: null },
      password: { $exists: true, $ne: null }
    }).limit(5);

    console.log(`\nFound ${loginUsers.length} users with credentials:`);
    loginUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.email} (Role: ${user.role || 'Not set'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();