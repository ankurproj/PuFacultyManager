const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

async function simulateProfileUpdate() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');

    const userEmail = 'skvjey@pondiuni.ac.in';
    const nodeId = 941;

    // Find your current user
    console.log(`\n👤 Finding user: ${userEmail}`);
    const user = await Professor.findOne({ email: userEmail });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${user.name} (${user._id})`);

    console.log('\n📊 BEFORE UPDATE:');
    console.log(`🎓 Teaching Experience: ${user.teaching_experience?.length || 0}`);
    console.log(`📖 UGC Journals: ${user.ugc_approved_journals?.length || 0}`);
    console.log(`📚 Books: ${user.books?.length || 0}`);
    console.log(`🏆 Awards: ${user.awards?.length || 0}`);
    console.log(`🆔 Current Node ID: ${user.node_id || 'Not set'}`);

    // Simulate the integration endpoint workflow
    console.log('\n🔄 Simulating "Update My Profile" process...');

    // Load scraper components
    const FacultyDataScraper = require('./scrapers/facultyDataScraper');
    const DataTransformer = require('./utils/dataTransformer');

    // Step 1: Scrape data
    console.log('1️⃣ Scraping faculty data...');
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData(nodeId);
    console.log(`   ✅ Scraped data for: ${scrapedData.name}`);

    // Step 2: Transform data
    console.log('2️⃣ Transforming data...');
    const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);
    console.log(`   ✅ Transformed ${Object.keys(transformedData).length} data sections`);

    // Step 3: Prepare update (preserve credentials)
    console.log('3️⃣ Preparing database update...');
    const updateData = {
      // Preserve user authentication
      email: user.email, // Keep original email
      password: user.password, // Keep original password
      role: user.role, // Keep original role

      // Update profile information
      name: transformedData.name || user.name,
      department: transformedData.department || user.department,
      designation: transformedData.designation || user.designation,

      // Update academic data
      teaching_experience: transformedData.teaching_experience || [],
      research_experience: transformedData.research_experience || [],
      industry_experience: transformedData.industry_experience || [],

      // Publications
      ugc_papers: transformedData.ugc_papers || [],
      ugc_approved_journals: transformedData.ugc_approved_journals || [],
      non_ugc_papers: transformedData.non_ugc_papers || [],
      non_ugc_journals: transformedData.non_ugc_journals || [],
      conference_proceedings: transformedData.conference_proceedings || [],

      // Books
      books: transformedData.books || [],
      chapters_in_books: transformedData.chapters_in_books || [],
      edited_books: transformedData.edited_books || [],

      // Education and awards
      education: transformedData.education || [],
      awards: transformedData.awards || [],

      // Projects
      ongoing_projects: transformedData.ongoing_projects || [],
      completed_projects: transformedData.completed_projects || [],

      // Other data
      patents: transformedData.patents || [],
      patent_details: transformedData.patent_details || [],

      // Meta information
      node_id: nodeId,
      data_source: 'web_scraping',
      last_scraped: new Date(),
      scraped_sections: Object.keys(transformedData)
    };

    // Step 4: Update database
    console.log('4️⃣ Updating MongoDB Atlas...');
    const updatedUser = await Professor.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    console.log('✅ Database update successful!');

    // Step 5: Verify results
    console.log('\n📊 AFTER UPDATE:');
    console.log(`👤 Name: ${updatedUser.name}`);
    console.log(`📧 Email: ${updatedUser.email} (preserved)`);
    console.log(`🎓 Teaching Experience: ${updatedUser.teaching_experience?.length || 0}`);
    console.log(`📖 UGC Journals: ${updatedUser.ugc_approved_journals?.length || 0}`);
    console.log(`📚 Books: ${updatedUser.books?.length || 0}`);
    console.log(`🏆 Awards: ${updatedUser.awards?.length || 0}`);
    console.log(`🆔 Node ID: ${updatedUser.node_id}`);
    console.log(`📅 Last Scraped: ${updatedUser.last_scraped}`);
    console.log(`📊 Data Source: ${updatedUser.data_source}`);

    // Show sample data to verify
    if (updatedUser.teaching_experience && updatedUser.teaching_experience.length > 0) {
      console.log('\n📋 Sample Teaching Experience:');
      updatedUser.teaching_experience.slice(0, 3).forEach((exp, index) => {
        console.log(`   ${index + 1}. ${exp.designation || exp.position} at ${exp.institution || exp.organization}`);
      });
    }

    if (updatedUser.ugc_approved_journals && updatedUser.ugc_approved_journals.length > 0) {
      console.log('\n📝 Sample Publications:');
      updatedUser.ugc_approved_journals.slice(0, 3).forEach((pub, index) => {
        console.log(`   ${index + 1}. "${pub.title}" - ${pub.year}`);
      });
    }

    console.log('\n🎉 SUCCESS! "Update My Profile" simulation completed successfully!');
    console.log('\n🚀 READY TO TEST:');
    console.log('1. Start backend: node index.js');
    console.log('2. Start frontend: npm start');
    console.log('3. Login with: skvjey@pondiuni.ac.in');
    console.log('4. Use "Update My Profile" with Node ID 941');
    console.log('5. Watch tables automatically refresh!');

  } catch (error) {
    console.error('❌ Profile update simulation failed:', error.message);
    console.error('📋 Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

simulateProfileUpdate();