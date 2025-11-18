const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

const checkScrapedProjectData = async () => {
  try {
    console.log('🔍 Checking for Scraped Project/Consultancy Data');
    console.log('===============================================');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to database');

    // Check both JAYAKUMAR profiles for scraped data
    const professors = await Professor.find({
      name: { $regex: 'JAYAKUMAR', $options: 'i' }
    });

    for (const prof of professors) {
      console.log(`\n👨‍🏫 Profile: ${prof.name} (${prof.email})`);
      console.log(`   ID: ${prof._id}`);

      // Check all possible fields that might contain scraped project data
      const potentialFields = [
        'projects',
        'consultancy_works',
        'research_projects_funded',
        'ongoing_projects',
        'completed_projects',
        'ongoing_consultancy_works',
        'completed_consultancy_works',
        'awards', // Sometimes project awards are listed here
        'books', // Sometimes project publications
        'conference_proceedings' // Sometimes project outcomes
      ];

      for (const field of potentialFields) {
        const data = prof[field];
        if (data && Array.isArray(data) && data.length > 0) {
          console.log(`\n   📋 ${field}: ${data.length} items`);

          // Show first item details
          const firstItem = data[0];
          if (firstItem) {
            const plainItem = firstItem.toObject ? firstItem.toObject() : firstItem;
            console.log(`      First item:`, JSON.stringify(plainItem, null, 2).substring(0, 300) + '...');
          }
        }
      }
    }

    // Also check if there are any text fields that might contain project information
    console.log('\n📝 Checking text fields for project keywords...');

    for (const prof of professors) {
      const professorObj = prof.toObject();
      const projectKeywords = ['project', 'consultancy', 'funding', 'grant', 'research', 'UGC', 'MHRD', 'DST', 'IoT', 'Smart Cities'];

      for (const [key, value] of Object.entries(professorObj)) {
        if (typeof value === 'string' && value.length > 20) {
          const hasKeyword = projectKeywords.some(keyword =>
            value.toLowerCase().includes(keyword.toLowerCase())
          );

          if (hasKeyword) {
            console.log(`\n   📄 Field "${key}" contains project keywords:`);
            console.log(`      "${value.substring(0, 150)}..."`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

checkScrapedProjectData();