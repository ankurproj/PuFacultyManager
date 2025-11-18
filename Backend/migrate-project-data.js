const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

const migrateProjectData = async () => {
  try {
    console.log('🔄 Migrating Project Data Between Profiles');
    console.log('=========================================');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to database');

    // Source: Profile with project data (gmail.com)
    const sourceProf = await Professor.findById('691119dd1d472a4405ac5828');
    // Target: Profile without project data (pondiuni.ac.in)
    const targetProf = await Professor.findById('68d399a034fd1c8cf6f5ef47');

    if (!sourceProf || !targetProf) {
      console.log('❌ One or both professors not found');
      return;
    }

    console.log(`\n📋 Source: ${sourceProf.name} (${sourceProf.email})`);
    console.log(`   Ongoing Projects: ${sourceProf.ongoing_projects?.length || 0}`);
    console.log(`   Completed Projects: ${sourceProf.completed_projects?.length || 0}`);
    console.log(`   Completed Consultancy: ${sourceProf.completed_consultancy_works?.length || 0}`);

    console.log(`\n📋 Target: ${targetProf.name} (${targetProf.email})`);
    console.log(`   Ongoing Projects: ${targetProf.ongoing_projects?.length || 0}`);
    console.log(`   Completed Projects: ${targetProf.completed_projects?.length || 0}`);
    console.log(`   Completed Consultancy: ${targetProf.completed_consultancy_works?.length || 0}`);

    // Copy project data from source to target
    const updateData = {};

    if (sourceProf.ongoing_projects && sourceProf.ongoing_projects.length > 0) {
      updateData.ongoing_projects = sourceProf.ongoing_projects.map(p => p.toObject());
      console.log(`\n✅ Will copy ${updateData.ongoing_projects.length} ongoing projects`);
    }

    if (sourceProf.completed_projects && sourceProf.completed_projects.length > 0) {
      updateData.completed_projects = sourceProf.completed_projects.map(p => p.toObject());
      console.log(`✅ Will copy ${updateData.completed_projects.length} completed projects`);
    }

    if (sourceProf.completed_consultancy_works && sourceProf.completed_consultancy_works.length > 0) {
      updateData.completed_consultancy_works = sourceProf.completed_consultancy_works.map(p => p.toObject());
      console.log(`✅ Will copy ${updateData.completed_consultancy_works.length} completed consultancy works`);
    }

    if (Object.keys(updateData).length > 0) {
      await Professor.findByIdAndUpdate('68d399a034fd1c8cf6f5ef47', updateData);
      console.log('\n🎉 Project data migration completed successfully!');

      // Verify the migration
      const updatedProf = await Professor.findById('68d399a034fd1c8cf6f5ef47');
      console.log('\n📊 Verification - Updated target profile:');
      console.log(`   Ongoing Projects: ${updatedProf.ongoing_projects?.length || 0}`);
      console.log(`   Completed Projects: ${updatedProf.completed_projects?.length || 0}`);
      console.log(`   Completed Consultancy: ${updatedProf.completed_consultancy_works?.length || 0}`);

      if (updatedProf.ongoing_projects?.length > 0) {
        console.log(`   Sample ongoing project: ${updatedProf.ongoing_projects[0].title_of_project}`);
      }
      if (updatedProf.completed_projects?.length > 0) {
        console.log(`   Sample completed project: ${updatedProf.completed_projects[0].title_of_project}`);
      }
    } else {
      console.log('\n⚠️  No project data found to migrate');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

migrateProjectData();