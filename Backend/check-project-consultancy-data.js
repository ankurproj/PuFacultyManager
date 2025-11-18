const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

const checkProjectConsultancyData = async () => {
  try {
    console.log('🔄 Checking Project & Consultancy Data');
    console.log('=====================================');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to database');

    // Find professors with any project/consultancy data
    const professors = await Professor.find({
      $or: [
        { 'projects.0': { $exists: true } },
        { 'consultancy_works.0': { $exists: true } },
        { 'ongoing_projects.0.title_of_project': { $ne: '' } },
        { 'ongoing_consultancy_works.0.title_of_consultancy_work': { $ne: '' } },
        { 'completed_projects.0.title_of_project': { $ne: '' } },
        { 'completed_consultancy_works.0.title_of_consultancy_work': { $ne: '' } },
        { 'research_projects_funded.0.project_title': { $ne: '' } }
      ]
    }).select('name projects consultancy_works ongoing_projects ongoing_consultancy_works completed_projects completed_consultancy_works research_projects_funded');

    console.log(`\n👨‍🏫 Found ${professors.length} professors with project/consultancy data:`);

    for (const professor of professors) {
      console.log(`\n📋 Professor: ${professor.name}`);

      // Check scraped project data (projects array)
      if (professor.projects && professor.projects.length > 0 && professor.projects[0].title) {
        console.log(`  📚 Scraped Projects: ${professor.projects.length}`);
        professor.projects.slice(0, 2).forEach((project, idx) => {
          console.log(`    ${idx + 1}. Title: ${project.title}`);
          console.log(`       Agency: ${project.funding_agency}`);
          console.log(`       Amount: ${project.amount}`);
          console.log(`       Status: ${project.status}`);
        });
      }

      // Check scraped consultancy data (consultancy_works array)
      if (professor.consultancy_works && professor.consultancy_works.length > 0 && professor.consultancy_works[0].title) {
        console.log(`  💼 Scraped Consultancy Works: ${professor.consultancy_works.length}`);
        professor.consultancy_works.slice(0, 2).forEach((work, idx) => {
          console.log(`    ${idx + 1}. Title: ${work.title}`);
          console.log(`       Organization: ${work.organization}`);
          console.log(`       Amount: ${work.amount}`);
          console.log(`       Status: ${work.status}`);
        });
      }

      // Check manual entry fields
      if (professor.ongoing_projects && professor.ongoing_projects.length > 0 && professor.ongoing_projects[0].title_of_project) {
        console.log(`  ⏳ Manual Ongoing Projects: ${professor.ongoing_projects.length}`);
      }
      if (professor.completed_projects && professor.completed_projects.length > 0 && professor.completed_projects[0].title_of_project) {
        console.log(`  ✅ Manual Completed Projects: ${professor.completed_projects.length}`);
      }
      if (professor.ongoing_consultancy_works && professor.ongoing_consultancy_works.length > 0 && professor.ongoing_consultancy_works[0].title_of_consultancy_work) {
        console.log(`  ⏳ Manual Ongoing Consultancy: ${professor.ongoing_consultancy_works.length}`);
      }
      if (professor.completed_consultancy_works && professor.completed_consultancy_works.length > 0 && professor.completed_consultancy_works[0].title_of_consultancy_work) {
        console.log(`  ✅ Manual Completed Consultancy: ${professor.completed_consultancy_works.length}`);
      }
      if (professor.research_projects_funded && professor.research_projects_funded.length > 0 && professor.research_projects_funded[0].project_title) {
        console.log(`  🎯 Research Projects Funded: ${professor.research_projects_funded.length}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Total professors with project/consultancy data: ${professors.length}`);

    const scrapedProjectsCount = professors.filter(p => p.projects && p.projects.length > 0 && p.projects[0].title).length;
    const scrapedConsultancyCount = professors.filter(p => p.consultancy_works && p.consultancy_works.length > 0 && p.consultancy_works[0].title).length;

    console.log(`  Professors with scraped projects: ${scrapedProjectsCount}`);
    console.log(`  Professors with scraped consultancy: ${scrapedConsultancyCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

checkProjectConsultancyData();