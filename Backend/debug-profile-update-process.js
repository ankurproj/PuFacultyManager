const mongoose = require('mongoose');
const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');
const Professor = require('./Professor');
require('dotenv').config();

async function debugProfileUpdateProcess() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');

    const nodeId = 941;
    const userEmail = 'skvjey@pondiuni.ac.in';

    console.log(`\n🕷️ Scraping data for Node ID: ${nodeId}`);

    // Initialize scraper
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData(nodeId);

    console.log('✅ Data scraped successfully');
    console.log(`📊 Scraped specialization: ${JSON.stringify(scrapedData.specialization, null, 2)}`);

    // Transform data
    const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);
    console.log('✅ Data transformed successfully');
    console.log(`📊 Transformed area_of_expertise: ${JSON.stringify(transformedData.area_of_expertise, null, 2)}`);

    // Find current user
    console.log(`\n👤 Finding user: ${userEmail}`);
    const currentUser = await Professor.findOne({ email: userEmail });

    if (!currentUser) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${currentUser.name} (${currentUser._id})`);

    // Show current area_of_expertise
    console.log(`📊 Current area_of_expertise in DB: ${JSON.stringify(currentUser.area_of_expertise, null, 2)}`);

    // Prepare update data (same logic as integration endpoint)
    const updateData = {
      // Update scraped data fields
      area_of_expertise: transformedData.area_of_expertise || [],

      // Meta information
      node_id: nodeId,
      data_source: currentUser.data_source === 'manual' ? 'hybrid' : 'web_scraping',
      last_scraped: new Date()
    };

    console.log(`\n🔄 Update data area_of_expertise: ${JSON.stringify(updateData.area_of_expertise, null, 2)}`);

    // Simulate the update process
    console.log('\n🔄 Updating user profile...');
    const updatedUser = await Professor.findByIdAndUpdate(
      currentUser._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log('✅ Profile updated successfully!');

    // Verify the update
    console.log(`\n📊 Updated area_of_expertise in DB: ${JSON.stringify(updatedUser.area_of_expertise, null, 2)}`);

    // Double check by re-fetching from database
    const verifyUser = await Professor.findById(currentUser._id);
    console.log(`📊 Verification - area_of_expertise in DB: ${JSON.stringify(verifyUser.area_of_expertise, null, 2)}`);

    if (verifyUser.area_of_expertise && verifyUser.area_of_expertise.length > 0) {
      console.log('\n✅ SUCCESS! area_of_expertise has been saved to database correctly!');
    } else {
      console.log('\n❌ ISSUE! area_of_expertise is still empty in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

debugProfileUpdateProcess();