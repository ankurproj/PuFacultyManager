const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

// Import the scraper and transformer (same as in integration route)
const FacultyDataScraper = require('./scrapers/FacultyDataScraper');
const DataTransformer = require('./scrapers/DataTransformer');

async function testProfileUpdate() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');

    const nodeId = 941;
    const userEmail = 'skvjey@pondiuni.ac.in';

    console.log(`\n🕷️ Scraping data for Node ID: ${nodeId}`);

    // Initialize scraper
    const scraper = new FacultyDataScraper();

    // Scrape faculty data
    const scrapedData = await scraper.scrapeFacultyData(nodeId);
    console.log('✅ Data scraped successfully');
    console.log(`📊 Raw data keys: ${Object.keys(scrapedData)}`);

    // Transform data
    const transformer = new DataTransformer();
    const transformedData = transformer.transformFacultyData(scrapedData);
    console.log('✅ Data transformed successfully');
    console.log(`📊 Transformed data keys: ${Object.keys(transformedData)}`);

    // Show some sample data
    console.log('\n📖 PUBLICATIONS SAMPLE:');
    if (transformedData.publications) {
      console.log(`📚 Total Publications: ${transformedData.publications.length}`);
      transformedData.publications.slice(0, 2).forEach((pub, index) => {
        console.log(`   ${index + 1}. ${pub.title || pub.name || 'No title'}`);
      });
    }

    console.log('\n🎓 EXPERIENCE SAMPLE:');
    if (transformedData.experience) {
      console.log(`💼 Total Experience: ${transformedData.experience.length}`);
      transformedData.experience.slice(0, 2).forEach((exp, index) => {
        console.log(`   ${index + 1}. ${exp.position || exp.designation || 'No position'} at ${exp.institution || exp.organization || 'Unknown'}`);
      });
    }

    // Find user
    console.log(`\n👤 Finding user: ${userEmail}`);
    const user = await Professor.findOne({ email: userEmail });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${user.name}`);

    // Prepare update data (preserve email and password)
    const updateData = {
      ...transformedData,
      scraped_date: new Date(),
      data_source: 'web_scraping',
      nodeId: nodeId,
      // Preserve authentication fields
      email: user.email,
      password: user.password
    };

    console.log('\n🔄 Updating user profile...');

    // Update the user
    const updatedUser = await Professor.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: false }
    );

    console.log('✅ Profile updated successfully!');
    console.log(`📊 Updated fields count: ${Object.keys(updateData).length}`);

    // Verify the update
    console.log('\n✔️ VERIFICATION - Updated Profile:');
    console.log(`📖 Publications: ${updatedUser.publications ? updatedUser.publications.length : 0}`);
    console.log(`🎓 Experience: ${updatedUser.experience ? updatedUser.experience.length : 0}`);
    console.log(`📝 UGC Papers: ${updatedUser.ugc_papers ? updatedUser.ugc_papers.length : 0}`);
    console.log(`📄 Non-UGC Papers: ${updatedUser.non_ugc_papers ? updatedUser.non_ugc_papers.length : 0}`);
    console.log(`🏆 Patents: ${updatedUser.patents ? updatedUser.patents.length : 0}`);
    console.log(`🔄 Scraped Date: ${updatedUser.scraped_date}`);
    console.log(`🆔 Node ID: ${updatedUser.nodeId}`);

  } catch (error) {
    console.error('❌ Profile update failed:', error.message);
    console.error('📋 Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

testProfileUpdate();