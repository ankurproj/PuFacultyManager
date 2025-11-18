/**
 * Debug script to check research guidance data in database
 */

const mongoose = require('mongoose');
const Professor = require('./Professor');

async function debugResearchGuidanceData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience');

    console.log('🔍 Debugging research guidance data...\n');

    // Find the professor with node_id 941
    const professor = await Professor.findOne({ node_id: '941' });

    if (!professor) {
      console.log('❌ No professor found with node_id 941');
      return;
    }

    console.log(`👤 Professor: ${professor.name} (${professor.email})`);
    console.log(`🆔 Professor ID: ${professor._id}`);
    console.log(`🔗 Node ID: ${professor.node_id}`);
    console.log('');

    // Check PG guidance
    console.log('🔍 PG GUIDANCE:');
    console.log(`Count: ${professor.pg_guidance?.length || 0}`);
    if (professor.pg_guidance?.length > 0) {
      professor.pg_guidance.slice(0, 3).forEach((guidance, i) => {
        console.log(`  PG Guidance ${i + 1}:`);
        console.log(`    Year: "${guidance.year}"`);
        console.log(`    Degree: "${guidance.degree}"`);
        console.log(`    Students awarded: "${guidance.students_awarded}"`);
        console.log(`    Student names: "${guidance.student_names}"`);
        console.log(`    Department: "${guidance.department_centre}"`);
        console.log('');
      });
      if (professor.pg_guidance.length > 3) {
        console.log(`  ... and ${professor.pg_guidance.length - 3} more PG guidance records`);
      }
    } else {
      console.log('  No PG guidance found');
    }
    console.log('');

    // Check PhD guidance
    console.log('🔍 PHD GUIDANCE:');
    console.log(`Count: ${professor.phd_guidance?.length || 0}`);
    if (professor.phd_guidance?.length > 0) {
      professor.phd_guidance.forEach((guidance, i) => {
        console.log(`  PhD Guidance ${i + 1}:`);
        console.log(`    Student name: "${guidance.student_name}"`);
        console.log(`    Registration date: "${guidance.registration_date}"`);
        console.log(`    Registration no: "${guidance.registration_no}"`);
        console.log(`    Thesis title: "${guidance.thesis_title}"`);
        console.log(`    Thesis status: "${guidance.thesis_submitted_status}"`);
        console.log(`    Date awarded: "${guidance.date_awarded}"`);
        console.log('');
      });
    } else {
      console.log('  No PhD guidance found');
    }
    console.log('');

    // Check PostDoc guidance
    console.log('🔍 POSTDOC GUIDANCE:');
    console.log(`Count: ${professor.postdoc_guidance?.length || 0}`);
    if (professor.postdoc_guidance?.length > 0) {
      professor.postdoc_guidance.forEach((guidance, i) => {
        console.log(`  PostDoc Guidance ${i + 1}:`);
        console.log(`    Scholar name: "${guidance.scholar_name}"`);
        console.log(`    Designation: "${guidance.designation}"`);
        console.log(`    Funding agency: "${guidance.funding_agency}"`);
        console.log(`    Fellowship title: "${guidance.fellowship_title}"`);
        console.log(`    Year joining: "${guidance.year_of_joining}"`);
        console.log(`    Year completion: "${guidance.year_of_completion}"`);
        console.log('');
      });
    } else {
      console.log('  No PostDoc guidance found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugResearchGuidanceData();