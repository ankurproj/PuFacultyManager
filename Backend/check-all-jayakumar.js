/**
 * Check all professors with node_id 941 or similar name
 */

const mongoose = require('mongoose');
const Professor = require('./Professor');

async function checkAllProfessors() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience');

    console.log('🔍 Checking all professors...\n');

    // Find all professors with JAYAKUMAR or node_id 941
    const professors = await Professor.find({
      $or: [
        { node_id: '941' },
        { name: /JAYAKUMAR/i }
      ]
    });

    console.log(`Found ${professors.length} professors:\n`);

    professors.forEach((prof, index) => {
      console.log(`👤 Professor ${index + 1}:`);
      console.log(`   Name: ${prof.name}`);
      console.log(`   Email: ${prof.email}`);
      console.log(`   ID: ${prof._id}`);
      console.log(`   Node ID: ${prof.node_id}`);
      console.log(`   Data source: ${prof.data_source}`);
      console.log(`   Last scraped: ${prof.last_scraped}`);
      console.log(`   Ongoing projects: ${prof.ongoing_projects?.length || 0}`);
      console.log(`   Completed projects: ${prof.completed_projects?.length || 0}`);
      console.log(`   Ongoing consultancy: ${prof.ongoing_consultancy_works?.length || 0}`);
      console.log(`   Completed consultancy: ${prof.completed_consultancy_works?.length || 0}`);

      // Show actual data for projects if exists
      if (prof.ongoing_projects?.length > 0) {
        console.log(`   First ongoing project title: "${prof.ongoing_projects[0].title_of_project}"`);
      }
      if (prof.completed_projects?.length > 0) {
        console.log(`   First completed project title: "${prof.completed_projects[0].title_of_project}"`);
      }
      if (prof.ongoing_consultancy_works?.length > 0) {
        console.log(`   First ongoing consultancy title: "${prof.ongoing_consultancy_works[0].title_of_consultancy_work}"`);
      }
      if (prof.completed_consultancy_works?.length > 0) {
        console.log(`   First completed consultancy title: "${prof.completed_consultancy_works[0].title_of_consultancy_work}"`);
      }

      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAllProfessors();