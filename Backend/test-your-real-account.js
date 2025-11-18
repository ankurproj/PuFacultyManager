const mongoose = require('mongoose');
const Professor = require('./Professor'); // Use the actual model
require('dotenv').config();

async function testYourAccount() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');

    // Find your account
    console.log('\n🔍 Looking for your account: skvjey@pondiuni.ac.in');
    const yourAccount = await Professor.findOne({ email: 'skvjey@pondiuni.ac.in' });

    if (!yourAccount) {
      console.log('❌ Account not found');
      return;
    }

    console.log('✅ Found your account!');
    console.log(`📧 Email: ${yourAccount.email}`);
    console.log(`👤 Name: ${yourAccount.name}`);
    console.log(`🆔 ID: ${yourAccount._id}`);
    console.log(`🔒 Password Hash: ${yourAccount.password ? 'Present' : 'Missing'}`);

    // Check if there's any academic data
    console.log('\n📚 ACADEMIC DATA CHECK:');
    console.log(`📖 Publications: ${yourAccount.publications ? yourAccount.publications.length : 0}`);
    console.log(`🎓 Experience: ${yourAccount.experience ? yourAccount.experience.length : 0}`);
    console.log(`📝 UGC Papers: ${yourAccount.ugc_papers ? yourAccount.ugc_papers.length : 0}`);
    console.log(`📄 Non-UGC Papers: ${yourAccount.non_ugc_papers ? yourAccount.non_ugc_papers.length : 0}`);
    console.log(`🏆 Patents: ${yourAccount.patents ? yourAccount.patents.length : 0}`);

    // Show some sample data if it exists
    if (yourAccount.publications && yourAccount.publications.length > 0) {
      console.log('\n📖 Sample Publications:');
      yourAccount.publications.slice(0, 2).forEach((pub, index) => {
        console.log(`   ${index + 1}. ${pub.title || pub.name || 'No title'}`);
      });
    }

    if (yourAccount.experience && yourAccount.experience.length > 0) {
      console.log('\n🎓 Sample Experience:');
      yourAccount.experience.slice(0, 2).forEach((exp, index) => {
        console.log(`   ${index + 1}. ${exp.position || exp.designation || 'No position'} at ${exp.institution || exp.organization || 'Unknown institution'}`);
      });
    }

    // Check scraped data
    console.log('\n🕷️ SCRAPING DATA CHECK:');
    console.log(`🔄 Scraped Date: ${yourAccount.scraped_date || 'Never'}`);
    console.log(`📊 Data Source: ${yourAccount.data_source || 'manual'}`);
    console.log(`🆔 Node ID: ${yourAccount.nodeId || 'Not set'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

testYourAccount();