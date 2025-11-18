/**
 * Test updating conference/seminar/workshop data from scraped data
 */

const mongoose = require('mongoose');
const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');
const Professor = require('./Professor');

async function testConferenceDataUpdate() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience');
    console.log('🔌 Connected to database');

    // Use the logged-in user (pondiuni.ac.in)
    const userId = '68d399a034fd1c8cf6f5ef47'; // skvjey@pondiuni.ac.in
    const nodeId = '941';

    console.log(`👤 Testing conference/seminar/workshop update for user: ${userId}`);
    console.log(`🔗 Using node ID: ${nodeId}\n`);

    // Step 1: Check current conference data (before update)
    const currentUser = await Professor.findById(userId);
    console.log(`📋 BEFORE UPDATE:`);
    console.log(`   Name: ${currentUser.name}`);
    console.log(`   Email: ${currentUser.email}`);
    console.log(`   Invited talks: ${currentUser.invited_talks?.length || 0}`);
    console.log(`   Organized conferences: ${currentUser.conferences_seminars_workshops_organized?.length || 0}`);
    console.log(`   Participated workshops: ${currentUser.conferences_seminars_workshops_participated?.length || 0}\n`);

    // Step 2: Scrape and transform data (reusing existing test data structure)
    console.log('📡 Scraping faculty data...');
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData(nodeId);

    console.log('🔄 Transforming scraped data...');
    const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);

    console.log(`✅ Transformed conference/seminar/workshop data:`);
    console.log(`   Invited talks: ${transformedData.invited_talks?.length || 0}`);
    console.log(`   Organized conferences: ${transformedData.conferences_seminars_workshops_organized?.length || 0}`);
    console.log(`   Participated workshops: ${transformedData.conferences_seminars_workshops_participated?.length || 0}\n`);

    // Show sample data
    if (transformedData.invited_talks?.length > 0) {
      console.log(`🔍 First invited talk (transformed):`);
      const talk = transformedData.invited_talks[0];
      console.log(`   Title: "${talk.title_of_paper}"`);
      console.log(`   Conference: "${talk.conferences_seminar_workshop_training}"`);
      console.log(`   Organized by: "${talk.organized_by}"`);
      console.log(`   Level: "${talk.level}"`);
      console.log(`   Year: "${talk.year}"\n`);
    }

    if (transformedData.conferences_seminars_workshops_organized?.length > 0) {
      console.log(`🔍 First organized conference (transformed):`);
      const conf = transformedData.conferences_seminars_workshops_organized[0];
      console.log(`   Title: "${conf.title_of_programme}"`);
      console.log(`   Sponsors: "${conf.sponsors}"`);
      console.log(`   Venue/Duration: "${conf.venue_duration}"`);
      console.log(`   Level: "${conf.level}"`);
      console.log(`   Year: "${conf.year}"\n`);
    }

    // Step 3: Update with conference/seminar/workshop fields included
    const updateData = {
      name: transformedData.name || currentUser.name,
      department: transformedData.department || currentUser.department,
      designation: transformedData.designation || currentUser.designation,

      // Conference/Seminar/Workshop - THE KEY ADDITION
      invited_talks: transformedData.invited_talks || [],
      conferences_seminars_workshops_organized: transformedData.conferences_seminars_workshops_organized || [],
      conferences_seminars_workshops_participated: transformedData.conferences_seminars_workshops_participated || [],
      e_lecture_details: transformedData.e_lecture_details || [],
      online_education_conducted: transformedData.online_education_conducted || [],

      // Other fields...
      ongoing_projects: transformedData.ongoing_projects || [],
      completed_projects: transformedData.completed_projects || [],
      ongoing_consultancy_works: transformedData.ongoing_consultancy_works || [],
      completed_consultancy_works: transformedData.completed_consultancy_works || [],
      pg_guidance: transformedData.pg_guidance || [],
      phd_guidance: transformedData.phd_guidance || [],
      postdoc_guidance: transformedData.postdoc_guidance || [],

      // Meta information
      node_id: nodeId,
      data_source: currentUser.data_source === 'manual' ? 'hybrid' : 'web_scraping',
      last_scraped: new Date(),
    };

    console.log(`📦 Conference/seminar/workshop data to update:`);
    console.log(`   Invited talks to update: ${updateData.invited_talks?.length || 0}`);
    console.log(`   Organized conferences to update: ${updateData.conferences_seminars_workshops_organized?.length || 0}`);
    console.log(`   Participated workshops to update: ${updateData.conferences_seminars_workshops_participated?.length || 0}\n`);

    // Step 4: Perform the update
    console.log('💾 Updating user profile with conference/seminar/workshop data...');
    const updatedUser = await Professor.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Step 5: Verify the update
    console.log(`📋 AFTER UPDATE:`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Invited talks: ${updatedUser.invited_talks?.length || 0}`);
    console.log(`   Organized conferences: ${updatedUser.conferences_seminars_workshops_organized?.length || 0}`);
    console.log(`   Participated workshops: ${updatedUser.conferences_seminars_workshops_participated?.length || 0}\n`);

    // Show actual updated data
    if (updatedUser.invited_talks?.length > 0) {
      console.log(`🔍 First invited talk in database:`);
      const talk = updatedUser.invited_talks[0];
      console.log(`   Title: "${talk.title_of_paper}"`);
      console.log(`   Conference: "${talk.conferences_seminar_workshop_training}"`);
      console.log(`   Organized by: "${talk.organized_by}"`);
      console.log(`   Level: "${talk.level}"`);
      console.log(`   Year: "${talk.year}"`);
    }

    if (updatedUser.conferences_seminars_workshops_organized?.length > 0) {
      console.log(`\n🔍 First organized conference in database:`);
      const conf = updatedUser.conferences_seminars_workshops_organized[0];
      console.log(`   Title: "${conf.title_of_programme}"`);
      console.log(`   Sponsors: "${conf.sponsors}"`);
      console.log(`   Venue/Duration: "${conf.venue_duration}"`);
      console.log(`   Level: "${conf.level}"`);
      console.log(`   Year: "${conf.year}"`);
    }

    console.log(`\n✅ Conference/seminar/workshop data update completed successfully!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

testConferenceDataUpdate();