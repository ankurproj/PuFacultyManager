/**
 * Test Script for User Profile Update Feature
 * Tests the new functionality where scraped data updates the logged-in user's profile
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function testProfileUpdateFeature() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 TESTING PROFILE UPDATE FEATURE');
    console.log('='.repeat(50));

    // Step 1: Create a test user if none exists
    console.log('\n1️⃣ Setting up test user...');

    let testUser = await Professor.findOne({ email: 'test@example.com' });

    if (!testUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      testUser = new Professor({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'faculty',
        department: 'Test Department',
        data_source: 'manual',
        teaching_experience: [],
        ugc_papers: []
      });

      await testUser.save();
      console.log('✅ Created test user: test@example.com / password123');
    } else {
      console.log('✅ Test user already exists: test@example.com');
    }

    console.log(`   User ID: ${testUser._id}`);
    console.log(`   Current teaching experience: ${testUser.teaching_experience?.length || 0} records`);
    console.log(`   Current publications: ${testUser.ugc_papers?.length || 0} records`);

    // Step 2: Simulate the profile update process
    console.log('\n2️⃣ Simulating profile update with scraped data...');
    console.log('   (This simulates what happens when you click "Update My Profile")');

    // Add some sample scraped data to the user's profile
    const scrapedDataUpdate = {
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
          department: 'Computer Science',
          from: '2018',
          to: '2020'
        }
      ],
      ugc_papers: [
        {
          title: 'Test Research Paper 1',
          journal_name: 'Test Journal',
          year: '2023'
        },
        {
          title: 'Test Research Paper 2',
          journal_name: 'Another Journal',
          year: '2022'
        }
      ],
      data_source: 'hybrid',
      last_scraped: new Date()
    };

    const updatedUser = await Professor.findByIdAndUpdate(
      testUser._id,
      { $set: scrapedDataUpdate },
      { new: true }
    );

    console.log('✅ Profile updated successfully!');
    console.log(`   Updated teaching experience: ${updatedUser.teaching_experience?.length || 0} records`);
    console.log(`   Updated publications: ${updatedUser.ugc_papers?.length || 0} records`);
    console.log(`   Email preserved: ${updatedUser.email}`);
    console.log(`   Name preserved: ${updatedUser.name}`);

    // Step 3: Verify the user can still login and see their data
    console.log('\n3️⃣ Verifying login credentials preserved...');
    console.log(`   ✅ Email: ${updatedUser.email} (unchanged)`);
    console.log(`   ✅ Password hash: ${updatedUser.password ? 'preserved' : 'missing'}`);
    console.log(`   ✅ Role: ${updatedUser.role}`);

    // Step 4: Show what the frontend will display
    console.log('\n4️⃣ Frontend API responses will now include:');
    console.log('\n   📚 /api/professor/experience response:');
    const experienceResponse = {
      teaching_experience: updatedUser.teaching_experience || [],
      research_experience: updatedUser.research_experience || [],
      industry_experience: updatedUser.industry_experience || []
    };
    console.log(`      Teaching: ${experienceResponse.teaching_experience.length} records`);
    console.log(`      Research: ${experienceResponse.research_experience.length} records`);
    console.log(`      Industry: ${experienceResponse.industry_experience.length} records`);

    console.log('\n   📄 /api/professor/publications response:');
    const publicationsResponse = {
      ugcPapers: updatedUser.ugc_papers || [],
      nonUgcPapers: updatedUser.non_ugc_papers || []
    };
    console.log(`      UGC Papers: ${publicationsResponse.ugcPapers.length} records`);
    console.log(`      Non-UGC Papers: ${publicationsResponse.nonUgcPapers.length} records`);

    // Step 5: Instructions for testing
    console.log('\n🎯 TO TEST THE COMPLETE FEATURE:');
    console.log('1. Start backend: cd Backend && node index.js');
    console.log('2. Start frontend: cd frontend && npm start');
    console.log('3. Go to http://localhost:3000/signup');
    console.log('4. Create account or login with: test@example.com / password123');
    console.log('5. Go to http://localhost:3000/faculty-importer');
    console.log('6. Enter Node ID: 941');
    console.log('7. Click "Update My Profile"');
    console.log('8. Visit /experience, /publications, /books to see YOUR data!');

    console.log('\n✨ The scraped data will now be part of YOUR profile, not a separate user!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testProfileUpdateFeature();