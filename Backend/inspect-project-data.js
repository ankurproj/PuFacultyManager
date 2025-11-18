const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

const inspectProjectData = async () => {
  try {
    console.log('🔍 Inspecting Project Data Structure');
    console.log('===================================');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to database');

    const professor = await Professor.findOne({ name: 'JAYAKUMAR S.K.V' });

    if (!professor) {
      console.log('❌ Professor not found');
      return;
    }

    console.log(`\n👨‍🏫 Inspecting data for: ${professor.name}`);

    // Check ongoing_projects
    console.log('\n📋 ongoing_projects:');
    console.log('  Array length:', professor.ongoing_projects?.length || 0);
    if (professor.ongoing_projects && professor.ongoing_projects.length > 0) {
      console.log('  First item raw:', professor.ongoing_projects[0]);
      console.log('  First item toObject:', professor.ongoing_projects[0].toObject());
      const plainItem = professor.ongoing_projects[0].toObject();
      console.log('  Title field:', `"${plainItem.title_of_project}"`);
      console.log('  Title exists:', !!plainItem.title_of_project);
      console.log('  Title not empty:', plainItem.title_of_project && plainItem.title_of_project.trim() !== '');
    }

    // Check completed_projects
    console.log('\n📋 completed_projects:');
    console.log('  Array length:', professor.completed_projects?.length || 0);
    if (professor.completed_projects && professor.completed_projects.length > 0) {
      console.log('  First item raw:', professor.completed_projects[0]);
      console.log('  First item toObject:', professor.completed_projects[0].toObject());
      const plainItem = professor.completed_projects[0].toObject();
      console.log('  Title field:', `"${plainItem.title_of_project}"`);
      console.log('  Title exists:', !!plainItem.title_of_project);
      console.log('  Title not empty:', plainItem.title_of_project && plainItem.title_of_project.trim() !== '');
    }

    // Check completed_consultancy_works
    console.log('\n📋 completed_consultancy_works:');
    console.log('  Array length:', professor.completed_consultancy_works?.length || 0);
    if (professor.completed_consultancy_works && professor.completed_consultancy_works.length > 0) {
      console.log('  First item raw:', professor.completed_consultancy_works[0]);
      console.log('  First item toObject:', professor.completed_consultancy_works[0].toObject());
      const plainItem = professor.completed_consultancy_works[0].toObject();
      console.log('  Title field:', `"${plainItem.title_of_consultancy_work}"`);
      console.log('  Title exists:', !!plainItem.title_of_consultancy_work);
      console.log('  Title not empty:', plainItem.title_of_consultancy_work && plainItem.title_of_consultancy_work.trim() !== '');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

inspectProjectData();