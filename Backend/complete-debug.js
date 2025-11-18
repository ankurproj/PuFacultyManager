/**
 * Complete Debug Script for Faculty Data Visibility Issues
 * This script tests the entire flow from database to frontend display
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function completeDataDebug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 STEP 1: Check if any data exists...');
    const allUsers = await Professor.find({});
    console.log(`📊 Total professors in database: ${allUsers.length}`);

    if (allUsers.length === 0) {
      console.log('\n❌ NO DATA FOUND IN DATABASE!');
      console.log('📝 This means you need to:');
      console.log('   1. Make sure Backend server is running (node index.js)');
      console.log('   2. Go to http://localhost:3000/faculty-importer');
      console.log('   3. Login with any existing credentials');
      console.log('   4. Enter Node ID: 941');
      console.log('   5. Click "Update Database" button');
      console.log('   6. Wait for successful import message');
      return;
    }

    console.log('\n🔍 STEP 2: Look for scraped data...');
    const scrapedUsers = allUsers.filter(user =>
      user.teaching_experience?.length > 0 ||
      user.ugc_papers?.length > 0 ||
      user.ugc_approved_journals?.length > 0 ||
      user.data_source === 'web_scraping'
    );

    console.log(`📈 Users with scraped data: ${scrapedUsers.length}`);

    if (scrapedUsers.length === 0) {
      console.log('\n⚠️  NO SCRAPED DATA FOUND!');
      console.log('📝 Available users in database:');
      allUsers.slice(0, 5).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name || 'No Name'} - ${user.email || 'No Email'}`);
        console.log(`      Teaching: ${user.teaching_experience?.length || 0}, Papers: ${user.ugc_papers?.length || 0}`);
      });
      console.log('\n💡 You need to run the "Update Database" process to import scraped data!');
      return;
    }

    console.log('\n🔍 STEP 3: Analyze scraped user data...');
    const scrapedUser = scrapedUsers[0];
    console.log(`👤 Scraped User: ${scrapedUser.name}`);
    console.log(`📧 Email: ${scrapedUser.email}`);
    console.log(`🆔 Database ID: ${scrapedUser._id}`);
    console.log(`🏢 Node ID: ${scrapedUser.node_id}`);
    console.log(`🔐 Has Password: ${!!scrapedUser.password}`);

    // Check data structure
    console.log('\n📊 Data Structure Check:');
    console.log(`   Teaching Experience: ${scrapedUser.teaching_experience?.length || 0} records`);
    console.log(`   Research Experience: ${scrapedUser.research_experience?.length || 0} records`);
    console.log(`   Industry Experience: ${scrapedUser.industry_experience?.length || 0} records`);
    console.log(`   UGC Papers: ${scrapedUser.ugc_papers?.length || 0} records`);
    console.log(`   UGC Approved Journals: ${scrapedUser.ugc_approved_journals?.length || 0} records`);
    console.log(`   Books: ${scrapedUser.books?.length || 0} records`);

    console.log('\n🔍 STEP 4: Check login capability...');
    if (!scrapedUser.email || !scrapedUser.password) {
      console.log('⚠️  User has no login credentials! Setting up...');

      const email = 'skvjey@gmail.com';
      const password = 'PUGA31K2ID';
      const hashedPassword = await bcrypt.hash(password, 10);

      await Professor.findByIdAndUpdate(scrapedUser._id, {
        email: email,
        password: hashedPassword,
        role: 'faculty'
      });

      console.log('✅ Login credentials set!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.log(`✅ User has login credentials: ${scrapedUser.email}`);
    }

    console.log('\n🔍 STEP 5: Sample data preview...');
    if (scrapedUser.teaching_experience?.length > 0) {
      console.log('📚 Sample Teaching Experience:');
      const sample = scrapedUser.teaching_experience[0];
      console.log(`   Designation: ${sample.designation}`);
      console.log(`   Institution: ${sample.institution}`);
      console.log(`   Department: ${sample.department}`);
      console.log(`   Period: ${sample.from} - ${sample.to}`);
    }

    if (scrapedUser.ugc_approved_journals?.length > 0) {
      console.log('\n📄 Sample Publication:');
      const sample = scrapedUser.ugc_approved_journals[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   Journal: ${sample.journal_name}`);
      console.log(`   Year: ${sample.year}`);
    }

    console.log('\n🎯 NEXT STEPS TO SEE DATA ON FRONTEND:');
    console.log('1. ✅ Make sure Backend is running (http://localhost:5000)');
    console.log('2. ✅ Make sure Frontend is running (http://localhost:3000)');
    console.log('3. 🔐 Login with credentials:');
    console.log(`   Email: ${scrapedUser.email}`);
    console.log('   Password: PUGA31K2ID');
    console.log('4. 📊 Visit these pages to see your data:');
    console.log('   • http://localhost:3000/experience');
    console.log('   • http://localhost:3000/publications');
    console.log('   • http://localhost:3000/books');
    console.log('   • http://localhost:3000/profile');

    console.log('\n🐛 IF YOU STILL SEE EMPTY TABLES:');
    console.log('• Open browser Developer Tools (F12)');
    console.log('• Go to Network tab');
    console.log('• Refresh the page');
    console.log('• Check if API calls are successful');
    console.log('• Look for any JavaScript errors in Console');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

completeDataDebug();