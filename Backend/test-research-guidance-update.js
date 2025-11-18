/**
 * Test updating research guidance data from scraped data
 */

const mongoose = require('mongoose');
const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');
const Professor = require('./Professor');

async function testResearchGuidanceUpdate() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience');
    console.log('🔌 Connected to database');

    // Use the logged-in user (pondiuni.ac.in)
    const userId = '68d399a034fd1c8cf6f5ef47'; // skvjey@pondiuni.ac.in
    const nodeId = '941';

    console.log(`👤 Testing research guidance update for user: ${userId}`);
    console.log(`🔗 Using node ID: ${nodeId}\n`);

    // Step 1: Check current research guidance (before update)
    const currentUser = await Professor.findById(userId);
    console.log(`📋 BEFORE UPDATE:`);
    console.log(`   Name: ${currentUser.name}`);
    console.log(`   Email: ${currentUser.email}`);
    console.log(`   PG guidance: ${currentUser.pg_guidance?.length || 0}`);
    console.log(`   PhD guidance: ${currentUser.phd_guidance?.length || 0}`);
    console.log(`   PostDoc guidance: ${currentUser.postdoc_guidance?.length || 0}\n`);

    // Step 2: Scrape and transform data
    console.log('📡 Scraping faculty data...');
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData(nodeId);

    console.log('🔄 Transforming scraped data...');
    const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);

    console.log(`✅ Transformed research guidance data:`);
    console.log(`   PG guidance: ${transformedData.pg_guidance?.length || 0}`);
    console.log(`   PhD guidance: ${transformedData.phd_guidance?.length || 0}`);
    console.log(`   PostDoc guidance: ${transformedData.postdoc_guidance?.length || 0}\n`);

    // Show sample data
    if (transformedData.pg_guidance?.length > 0) {
      console.log(`🔍 First PG guidance (transformed):`);
      const pg = transformedData.pg_guidance[0];
      console.log(`   Year: "${pg.year}"`);
      console.log(`   Degree: "${pg.degree}"`);
      console.log(`   Students awarded: "${pg.students_awarded}"`);
      console.log(`   Student names: "${pg.student_names}"`);
      console.log(`   Department: "${pg.department_centre}"\n`);
    }

    if (transformedData.phd_guidance?.length > 0) {
      console.log(`🔍 First PhD guidance (transformed):`);
      const phd = transformedData.phd_guidance[0];
      console.log(`   Student name: "${phd.student_name}"`);
      console.log(`   Registration date: "${phd.registration_date}"`);
      console.log(`   Registration no: "${phd.registration_no}"`);
      console.log(`   Thesis title: "${phd.thesis_title}"`);
      console.log(`   Date awarded: "${phd.date_awarded}"\n`);
    }

    // Step 3: Update with research guidance fields included
    const updateData = {
      name: transformedData.name || currentUser.name,
      department: transformedData.department || currentUser.department,
      designation: transformedData.designation || currentUser.designation,

      // Research Guidance - THE KEY ADDITION
      pg_guidance: transformedData.pg_guidance || [],
      phd_guidance: transformedData.phd_guidance || [],
      postdoc_guidance: transformedData.postdoc_guidance || [],

      // Other fields...
      ongoing_projects: transformedData.ongoing_projects || [],
      completed_projects: transformedData.completed_projects || [],
      ongoing_consultancy_works: transformedData.ongoing_consultancy_works || [],
      completed_consultancy_works: transformedData.completed_consultancy_works || [],

      // Meta information
      node_id: nodeId,
      data_source: currentUser.data_source === 'manual' ? 'hybrid' : 'web_scraping',
      last_scraped: new Date(),
    };

    console.log(`📦 Research guidance to update:`);
    console.log(`   PG guidance to update: ${updateData.pg_guidance?.length || 0}`);
    console.log(`   PhD guidance to update: ${updateData.phd_guidance?.length || 0}`);
    console.log(`   PostDoc guidance to update: ${updateData.postdoc_guidance?.length || 0}\n`);

    // Step 4: Perform the update
    console.log('💾 Updating user profile with research guidance...');
    const updatedUser = await Professor.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Step 5: Verify the update
    console.log(`📋 AFTER UPDATE:`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   PG guidance: ${updatedUser.pg_guidance?.length || 0}`);
    console.log(`   PhD guidance: ${updatedUser.phd_guidance?.length || 0}`);
    console.log(`   PostDoc guidance: ${updatedUser.postdoc_guidance?.length || 0}\n`);

    // Show actual updated data
    if (updatedUser.pg_guidance?.length > 0) {
      console.log(`🔍 First PG guidance in database:`);
      const pg = updatedUser.pg_guidance[0];
      console.log(`   Year: "${pg.year}"`);
      console.log(`   Degree: "${pg.degree}"`);
      console.log(`   Students awarded: "${pg.students_awarded}"`);
      console.log(`   Student names: "${pg.student_names}"`);
      console.log(`   Department: "${pg.department_centre}"`);
    }

    if (updatedUser.phd_guidance?.length > 0) {
      console.log(`\n🔍 First PhD guidance in database:`);
      const phd = updatedUser.phd_guidance[0];
      console.log(`   Student name: "${phd.student_name}"`);
      console.log(`   Registration date: "${phd.registration_date}"`);
      console.log(`   Registration no: "${phd.registration_no}"`);
      console.log(`   Thesis title: "${phd.thesis_title}"`);
      console.log(`   Date awarded: "${phd.date_awarded}"`);
    }

    console.log(`\n✅ Research guidance update completed successfully!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

testResearchGuidanceUpdate();