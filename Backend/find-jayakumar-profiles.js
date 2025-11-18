const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

const findJayakumarProfiles = async () => {
  try {
    console.log('🔍 Finding JAYAKUMAR S.K.V Profiles');
    console.log('==================================');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to database');

    // Find all professors with JAYAKUMAR name
    const professors = await Professor.find({
      name: { $regex: 'JAYAKUMAR', $options: 'i' }
    }).select('_id name email ongoing_projects completed_projects completed_consultancy_works');

    console.log(`\n👨‍🏫 Found ${professors.length} professors with JAYAKUMAR in name:`);

    for (const prof of professors) {
      console.log(`\n📋 Professor ID: ${prof._id}`);
      console.log(`   Name: ${prof.name}`);
      console.log(`   Email: ${prof.email}`);
      console.log(`   Ongoing Projects: ${prof.ongoing_projects?.length || 0}`);
      console.log(`   Completed Projects: ${prof.completed_projects?.length || 0}`);
      console.log(`   Completed Consultancy: ${prof.completed_consultancy_works?.length || 0}`);

      // Show data from the one with projects
      if (prof.ongoing_projects && prof.ongoing_projects.length > 0) {
        console.log(`   📚 Ongoing Project Sample: ${prof.ongoing_projects[0].title_of_project}`);
      }
      if (prof.completed_projects && prof.completed_projects.length > 0) {
        console.log(`   ✅ Completed Project Sample: ${prof.completed_projects[0].title_of_project}`);
      }
    }

    // Check which one is being used by the JWT token
    console.log('\n🔍 To debug: Check which professor ID matches the JWT token in your browser.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

findJayakumarProfiles();