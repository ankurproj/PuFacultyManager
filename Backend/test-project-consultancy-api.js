const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

const testProjectConsultancyAPI = async () => {
  try {
    console.log('🔄 Testing Project Consultancy API Response');
    console.log('=============================================');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to database');

    // Find JAYAKUMAR S.K.V who has project data
    const professor = await Professor.findOne({ name: 'JAYAKUMAR S.K.V' }).select('-password');

    if (!professor) {
      console.log('❌ Professor not found');
      return;
    }

    console.log(`\n👨‍🏫 Testing API response for: ${professor.name}`);

    // Simulate the API response logic
    const convertToPlainObjects = (items) => {
      if (!items || items.length === 0) return [];
      return items.map(item => item.toObject ? item.toObject() : item);
    };

    const hasActualData = (items, titleField) => {
      if (!items || items.length === 0) return false;
      return items.some(item => {
          const plainItem = item.toObject ? item.toObject() : item;
          return plainItem[titleField] && plainItem[titleField].trim() !== '';
      });
    };

    console.log('🔍 Checking data existence:');
    console.log('  ongoing_projects has data:', hasActualData(professor.ongoing_projects, 'title_of_project'));
    console.log('  completed_projects has data:', hasActualData(professor.completed_projects, 'title_of_project'));
    console.log('  completed_consultancy_works has data:', hasActualData(professor.completed_consultancy_works, 'title_of_consultancy_work'));

    const projectConsultancyData = {
      ongoing_projects: hasActualData(professor.ongoing_projects, 'title_of_project')
        ? convertToPlainObjects(professor.ongoing_projects)
        : [{
            title_of_project: "",
            sponsored_by: "",
            period: "",
            sanctioned_amount: "",
            year: "",
          }],
      ongoing_consultancy_works: convertToPlainObjects(professor.ongoing_consultancy_works).length > 0
        ? convertToPlainObjects(professor.ongoing_consultancy_works)
        : [{
            title_of_consultancy_work: "",
            sponsored_by: "",
            period: "",
            sanctioned_amount: "",
            year: "",
          }],
      completed_projects: convertToPlainObjects(professor.completed_projects).length > 0
        ? convertToPlainObjects(professor.completed_projects)
        : [{
            title_of_project: "",
            sponsored_by: "",
            period: "",
            sanctioned_amount: "",
            year: "",
          }],
      completed_consultancy_works: convertToPlainObjects(professor.completed_consultancy_works).length > 0
        ? convertToPlainObjects(professor.completed_consultancy_works)
        : [{
            title_of_consultancy_work: "",
            sponsored_by: "",
            period: "",
            sanctioned_amount: "",
            year: "",
          }],
      research_projects_funded: convertToPlainObjects(professor.research_projects_funded).length > 0
        ? convertToPlainObjects(professor.research_projects_funded)
        : [{
            pi_name: "",
            project_title: "",
            funding_agency: "",
            duration: "",
            year_of_award: "",
            amount: "",
          }]
    };

    console.log('\n📊 API Response Summary:');
    console.log(`  ongoing_projects: ${projectConsultancyData.ongoing_projects.length} items`);
    console.log(`  completed_projects: ${projectConsultancyData.completed_projects.length} items`);
    console.log(`  ongoing_consultancy_works: ${projectConsultancyData.ongoing_consultancy_works.length} items`);
    console.log(`  completed_consultancy_works: ${projectConsultancyData.completed_consultancy_works.length} items`);
    console.log(`  research_projects_funded: ${projectConsultancyData.research_projects_funded.length} items`);

    // Show sample data
    if (projectConsultancyData.ongoing_projects.length > 0 && projectConsultancyData.ongoing_projects[0].title_of_project) {
      console.log('\n🔍 Ongoing Project Sample:');
      const project = projectConsultancyData.ongoing_projects[0];
      console.log(`  Title: ${project.title_of_project}`);
      console.log(`  Sponsored by: ${project.sponsored_by}`);
      console.log(`  Period: ${project.period}`);
      console.log(`  Amount: ₹${project.sanctioned_amount} Lakhs`);
    }

    if (projectConsultancyData.completed_projects.length > 0 && projectConsultancyData.completed_projects[0].title_of_project) {
      console.log('\n🔍 Completed Project Sample:');
      const project = projectConsultancyData.completed_projects[0];
      console.log(`  Title: ${project.title_of_project}`);
      console.log(`  Sponsored by: ${project.sponsored_by}`);
      console.log(`  Period: ${project.period}`);
      console.log(`  Amount: ₹${project.sanctioned_amount} Lakhs`);
    }

    if (projectConsultancyData.completed_consultancy_works.length > 0 && projectConsultancyData.completed_consultancy_works[0].title_of_consultancy_work) {
      console.log('\n🔍 Completed Consultancy Sample:');
      const work = projectConsultancyData.completed_consultancy_works[0];
      console.log(`  Title: ${work.title_of_consultancy_work}`);
      console.log(`  Sponsored by: ${work.sponsored_by}`);
      console.log(`  Period: ${work.period}`);
      console.log(`  Amount: ₹${work.sanctioned_amount} Lakhs`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testProjectConsultancyAPI();