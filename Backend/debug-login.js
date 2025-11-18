const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function debugLogin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user we just created
    const user = await Professor.findOne({ email: 'test@example.com' });

    if (!user) {
      console.log('❌ User not found with email test@example.com');
      return;
    }

    console.log('👤 Found user:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Has password: ${!!user.password}`);
    console.log(`   Password hash: ${user.password ? user.password.substring(0, 30) + '...' : 'None'}`);

    // Test password manually
    console.log('\n🔐 Testing password...');
    const testPasswords = ['password123', 'Password123', 'PASSWORD123'];

    for (const testPass of testPasswords) {
      const isValid = await bcrypt.compare(testPass, user.password);
      console.log(`   "${testPass}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
    }

    // Create a fresh password to be sure
    console.log('\n🔄 Creating fresh password...');
    const newPassword = await bcrypt.hash('test123', 10);
    await Professor.findByIdAndUpdate(user._id, { password: newPassword });
    console.log('✅ Updated password to: test123');

    console.log('\n🧪 NOW TRY LOGGING IN WITH:');
    console.log('   Email: test@example.com');
    console.log('   Password: test123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugLogin();