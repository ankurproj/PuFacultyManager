const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function setupLoginForScrapedUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the scraped faculty user by node_id
    const faculty = await Professor.findOne({ node_id: "941" });

    if (!faculty) {
      console.log('❌ No faculty found with node_id 941');
      return;
    }

    console.log(`📝 Found faculty: ${faculty.name}`);
    console.log(`   Current email: ${faculty.email || 'Not set'}`);
    console.log(`   Has password: ${!!faculty.password}`);

    // Set up login credentials if they don't exist
    if (!faculty.email || !faculty.password) {
      console.log('\n🔧 Setting up login credentials...');

      const email = 'skvjey@gmail.com';
      const password = 'PUGA31K2ID';
      const hashedPassword = await bcrypt.hash(password, 10);

      const updateResult = await Professor.findByIdAndUpdate(
        faculty._id,
        {
          email: email,
          password: hashedPassword,
          role: 'faculty'
        },
        { new: true }
      );

      if (updateResult) {
        console.log('✅ Login credentials set successfully!');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Role: faculty`);
      } else {
        console.log('❌ Failed to update credentials');
      }
    } else {
      console.log('\n✅ User already has login credentials');
    }

    // Final verification
    const updatedUser = await Professor.findOne({ node_id: "941" });
    console.log('\n📊 Final user state:');
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Has Password: ${!!updatedUser.password}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Teaching Experience: ${updatedUser.teaching_experience?.length || 0} records`);
    console.log(`   Publications: ${updatedUser.ugc_approved_journals?.length || 0} UGC papers`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

setupLoginForScrapedUser();