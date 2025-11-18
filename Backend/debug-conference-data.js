/**
 * Debug script to check conference/seminar/workshop data in database
 */

const mongoose = require('mongoose');
const Professor = require('./Professor');

async function debugConferenceData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience');

    console.log('🔍 Debugging conference/seminar/workshop data...\n');

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

    // Check invited talks
    console.log('🔍 INVITED TALKS:');
    console.log(`Count: ${professor.invited_talks?.length || 0}`);
    if (professor.invited_talks?.length > 0) {
      professor.invited_talks.slice(0, 3).forEach((talk, i) => {
        console.log(`  Invited Talk ${i + 1}:`);
        console.log(`    Title: "${talk.title_of_paper}"`);
        console.log(`    Conference: "${talk.conferences_seminar_workshop_training}"`);
        console.log(`    Organized by: "${talk.organized_by}"`);
        console.log(`    Level: "${talk.level}"`);
        console.log(`    Year: "${talk.year}"`);
        console.log('');
      });
      if (professor.invited_talks.length > 3) {
        console.log(`  ... and ${professor.invited_talks.length - 3} more invited talks`);
      }
    } else {
      console.log('  No invited talks found');
    }
    console.log('');

    // Check organized conferences/seminars
    console.log('🔍 CONFERENCES/SEMINARS ORGANIZED:');
    console.log(`Count: ${professor.conferences_seminars_workshops_organized?.length || 0}`);
    if (professor.conferences_seminars_workshops_organized?.length > 0) {
      professor.conferences_seminars_workshops_organized.slice(0, 3).forEach((conf, i) => {
        console.log(`  Conference ${i + 1}:`);
        console.log(`    Title: "${conf.title_of_programme}"`);
        console.log(`    Sponsors: "${conf.sponsors}"`);
        console.log(`    Venue/Duration: "${conf.venue_duration}"`);
        console.log(`    Level: "${conf.level}"`);
        console.log(`    Year: "${conf.year}"`);
        console.log('');
      });
      if (professor.conferences_seminars_workshops_organized.length > 3) {
        console.log(`  ... and ${professor.conferences_seminars_workshops_organized.length - 3} more organized conferences`);
      }
    } else {
      console.log('  No organized conferences/seminars found');
    }
    console.log('');

    // Check participated workshops
    console.log('🔍 CONFERENCES/SEMINARS/WORKSHOPS PARTICIPATED:');
    console.log(`Count: ${professor.conferences_seminars_workshops_participated?.length || 0}`);
    if (professor.conferences_seminars_workshops_participated?.length > 0) {
      professor.conferences_seminars_workshops_participated.slice(0, 3).forEach((workshop, i) => {
        console.log(`  Workshop ${i + 1}:`);
        console.log(`    Title: "${workshop.title_of_programme}"`);
        console.log(`    Organized by: "${workshop.organized_by}"`);
        console.log(`    Venue/Duration: "${workshop.venue_duration}"`);
        console.log(`    Level: "${workshop.level}"`);
        console.log(`    Year: "${workshop.year}"`);
        console.log('');
      });
      if (professor.conferences_seminars_workshops_participated.length > 3) {
        console.log(`  ... and ${professor.conferences_seminars_workshops_participated.length - 3} more participated workshops`);
      }
    } else {
      console.log('  No participated workshops found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugConferenceData();