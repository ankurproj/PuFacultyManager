const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function createWorkingTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing test user to start fresh
    await Professor.deleteOne({ email: 'test@example.com' });
    console.log('🧹 Cleaned up existing test user');

    // Create new test user with proper credentials
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = new Professor({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'faculty',
      department: 'Computer Science',
      data_source: 'hybrid',

      // Add some test data to verify it shows up
      teaching_experience: [
        {
          designation: 'Associate Professor',
          institution: 'Test University',
          department: 'Computer Science',
          from: '2020',
          to: '2023'
        },
        {
          designation: 'Assistant Professor',
          institution: 'Test College',
          department: 'Information Technology',
          from: '2018',
          to: '2020'
        }
      ],

      research_experience: [
        {
          position: 'Research Associate',
          organization: 'Tech Research Lab',
          project: 'AI in Education',
          from: '2019',
          to: '2021'
        }
      ],

      ugc_papers: [
        {
          title: 'Advanced Machine Learning Techniques',
          journal_name: 'International Journal of AI',
          year: '2023',
          authors: 'Test User, Co-Author'
        },
        {
          title: 'Data Science Applications',
          journal_name: 'Journal of Computer Science',
          year: '2022',
          authors: 'Test User'
        }
      ]
    });

    const savedUser = await testUser.save();
    console.log('✅ Created test user successfully!');
    console.log(`   User ID: ${savedUser._id}`);
    console.log(`   Email: ${savedUser.email}`);
    console.log(`   Teaching Experience: ${savedUser.teaching_experience.length} records`);
    console.log(`   Research Experience: ${savedUser.research_experience.length} records`);
    console.log(`   Publications: ${savedUser.ugc_papers.length} records`);

    // Test login immediately
    console.log('\n🔐 Testing login credentials...');
    const loginTest = await bcrypt.compare('password123', savedUser.password);
    console.log(`   Password validation: ${loginTest ? '✅ VALID' : '❌ INVALID'}`);

    console.log('\n🎯 YOU CAN NOW:');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Login with: test@example.com / password123');
    console.log('   3. Visit http://localhost:3000/experience');
    console.log('   4. Visit http://localhost:3000/publications');
    console.log('   5. You should see the data above in the tables!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createWorkingTestUser();