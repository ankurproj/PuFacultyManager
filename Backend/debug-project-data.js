/**
 * Debug script to check project data in database and scraped data
 */

const mongoose = require('mongoose');
const Professor = require('./Professor');

async function debugProjectData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience');

    console.log('🔍 Debugging project data...\n');

    // Find the professor with node_id 941
    const professor = await Professor.findOne({ node_id: '941' });

    if (!professor) {
      console.log('❌ No professor found with node_id 941');
      return;
    }

    console.log(`👤 Professor: ${professor.name} (${professor.email})`);
    console.log(`📧 Email domain: ${professor.email.split('@')[1]}`);
    console.log(`🆔 Professor ID: ${professor._id}`);
    console.log(`🔗 Node ID: ${professor.node_id}`);
    console.log(`📊 Data source: ${professor.data_source}`);
    console.log(`📅 Last scraped: ${professor.last_scraped}`);
    console.log('');

    // Check ongoing projects
    console.log('🔍 ONGOING PROJECTS:');
    console.log(`Count: ${professor.ongoing_projects?.length || 0}`);
    if (professor.ongoing_projects?.length > 0) {
      professor.ongoing_projects.forEach((project, i) => {
        console.log(`  Project ${i + 1}:`);
        console.log(`    Title: "${project.title_of_project}"`);
        console.log(`    Sponsored by: "${project.sponsored_by}"`);
        console.log(`    Period: "${project.period}"`);
        console.log(`    Amount: "${project.sanctioned_amount}"`);
        console.log(`    Year: "${project.year}"`);
        console.log(`    Raw object:`, JSON.stringify(project, null, 4));
      });
    } else {
      console.log('  No ongoing projects found');
    }
    console.log('');

    // Check completed projects
    console.log('🔍 COMPLETED PROJECTS:');
    console.log(`Count: ${professor.completed_projects?.length || 0}`);
    if (professor.completed_projects?.length > 0) {
      professor.completed_projects.forEach((project, i) => {
        console.log(`  Project ${i + 1}:`);
        console.log(`    Title: "${project.title_of_project}"`);
        console.log(`    Sponsored by: "${project.sponsored_by}"`);
        console.log(`    Period: "${project.period}"`);
        console.log(`    Amount: "${project.sanctioned_amount}"`);
        console.log(`    Year: "${project.year}"`);
      });
    } else {
      console.log('  No completed projects found');
    }
    console.log('');

    // Check ongoing consultancy
    console.log('🔍 ONGOING CONSULTANCY WORKS:');
    console.log(`Count: ${professor.ongoing_consultancy_works?.length || 0}`);
    if (professor.ongoing_consultancy_works?.length > 0) {
      professor.ongoing_consultancy_works.forEach((consultancy, i) => {
        console.log(`  Consultancy ${i + 1}:`);
        console.log(`    Title: "${consultancy.title_of_consultancy_work}"`);
        console.log(`    Sponsored by: "${consultancy.sponsored_by}"`);
        console.log(`    Period: "${consultancy.period}"`);
        console.log(`    Amount: "${consultancy.sanctioned_amount}"`);
        console.log(`    Year: "${consultancy.year}"`);
      });
    } else {
      console.log('  No ongoing consultancy works found');
    }
    console.log('');

    // Check completed consultancy
    console.log('🔍 COMPLETED CONSULTANCY WORKS:');
    console.log(`Count: ${professor.completed_consultancy_works?.length || 0}`);
    if (professor.completed_consultancy_works?.length > 0) {
      professor.completed_consultancy_works.forEach((consultancy, i) => {
        console.log(`  Consultancy ${i + 1}:`);
        console.log(`    Title: "${consultancy.title_of_consultancy_work}"`);
        console.log(`    Sponsored by: "${consultancy.sponsored_by}"`);
        console.log(`    Period: "${consultancy.period}"`);
        console.log(`    Amount: "${consultancy.sanctioned_amount}"`);
        console.log(`    Year: "${consultancy.year}"`);
      });
    } else {
      console.log('  No completed consultancy works found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugProjectData();