const mongoose = require('mongoose');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function debugDataStructure() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find any users with scraped data
    const users = await Professor.find({
      $or: [
        { teaching_experience: { $exists: true, $ne: [] } },
        { ugc_papers: { $exists: true, $ne: [] } },
        { ugc_approved_journals: { $exists: true, $ne: [] } },
        { data_source: 'web_scraping' }
      ]
    });

    console.log(`\n📊 Found ${users.length} users with scraped data`);

    if (users.length > 0) {
      const user = users[0];
      console.log(`\n👤 User: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🆔 User ID: ${user._id}`);
      console.log(`🏢 Node ID: ${user.node_id}`);

      // Check the exact field names stored
      console.log('\n🔍 Database field analysis:');
      const fields = Object.keys(user.toObject());
      const dataFields = fields.filter(field =>
        field.includes('experience') ||
        field.includes('papers') ||
        field.includes('publications') ||
        field.includes('books') ||
        field.includes('journal')
      );

      console.log('📝 Data-related fields found:');
      dataFields.forEach(field => {
        const value = user[field];
        if (Array.isArray(value)) {
          console.log(`   ${field}: ${value.length} records`);
          if (value.length > 0) {
            console.log(`      Sample keys: ${Object.keys(value[0] || {}).join(', ')}`);
          }
        } else {
          console.log(`   ${field}: ${typeof value} (${value})`);
        }
      });

      // Check specific expected fields
      console.log('\n🎯 Checking expected API response fields:');
      const expectedFields = [
        'teachingExperience', 'teaching_experience',
        'researchExperience', 'research_experience',
        'industryExperience', 'industry_experience',
        'ugcPapers', 'ugc_papers', 'ugc_approved_journals',
        'nonUgcPapers', 'non_ugc_papers', 'non_ugc_journals',
        'books', 'publications'
      ];

      expectedFields.forEach(field => {
        const value = user[field];
        if (value) {
          console.log(`   ✅ ${field}: ${Array.isArray(value) ? value.length + ' records' : typeof value}`);
        } else {
          console.log(`   ❌ ${field}: Not found`);
        }
      });

      // Show sample data structure
      if (user.teaching_experience && user.teaching_experience.length > 0) {
        console.log('\n📚 Sample teaching experience structure:');
        console.log(JSON.stringify(user.teaching_experience[0], null, 2));
      }

      if (user.ugc_approved_journals && user.ugc_approved_journals.length > 0) {
        console.log('\n📄 Sample publication structure:');
        console.log(JSON.stringify(user.ugc_approved_journals[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugDataStructure();