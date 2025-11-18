const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');
const Professor = require('./Professor');
const mongoose = require('mongoose');

async function testCompleteProfileUpdate() {
  try {
    console.log('🔍 Testing Complete Profile Update with Research Experience...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas\n');

    // Step 1: Scrape data
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData('941');

    // Step 2: Transform data
    const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);

    // Step 3: Update database
    console.log('📄 Updating profile in database...');
    const updateData = {
      ...transformedData,
      lastProfileUpdate: new Date(),
      data_source: 'web_scraping',
      node_id: '941'
    };

    const updatedUser = await Professor.findOneAndUpdate(
      { email: 'skvjey@pondiuni.ac.in' },
      updateData,
      { new: true, upsert: true }
    );

    console.log('✅ Profile updated successfully!\n');

    // Step 4: Verify research experience update
    console.log('🔍 Verifying Research Experience in Database:');
    if (updatedUser.research_experience && updatedUser.research_experience.length > 0) {
      const researchExp = updatedUser.research_experience[0];
      console.log(`✅ Position: "${researchExp.position}"`);
      console.log(`✅ Organization: "${researchExp.organization}"`);
      console.log(`✅ Project/Research Area: "${researchExp.project}"`);
      console.log(`✅ From: "${researchExp.from}"`);
      console.log(`✅ To: "${researchExp.to}"`);

      if (researchExp.project === 'Services Computing') {
        console.log('\n🎉 SUCCESS: Research Area correctly mapped to Project field!');
        console.log('   The "Area of Research" from the scraped table is now stored in the "project" field');
      } else {
        console.log('\n❌ ISSUE: Project field does not contain expected research area');
      }
    } else {
      console.log('❌ No research experience found in updated profile');
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');

  } catch (error) {
    console.error('❌ Error testing complete profile update:', error.message);
    await mongoose.disconnect();
  }
}

testCompleteProfileUpdate();