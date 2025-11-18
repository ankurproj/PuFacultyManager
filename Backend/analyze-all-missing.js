const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience?retryWrites=true&w=majority&appName=Cluster1';

mongoose.connect(MONGODB_URI);

// Import Professor model
const Professor = require('./Professor');

async function analyzeAllMissingData() {
    try {
        console.log('🔍 Analyzing ALL missing data in conference fields...\n');

        // Find the professor (JAYAKUMAR)
        const professor = await Professor.findOne({ email: 'skvjey@pondiuni.ac.in' });

        if (!professor) {
            console.log('❌ Professor not found');
            return;
        }

        console.log(`👤 Analyzing data for: ${professor.name} (${professor.email})\n`);

        // Analyze invited talks
        console.log('📊 INVITED TALKS ANALYSIS:');
        console.log(`Total invited talks: ${professor.invited_talks?.length || 0}`);

        let missingConference = 0;
        let missingOrganizedBy = 0;

        if (professor.invited_talks) {
            professor.invited_talks.forEach((talk, index) => {
                if (!talk.conferences_seminar_workshop_training || talk.conferences_seminar_workshop_training.trim() === '') {
                    missingConference++;
                    console.log(`   Talk ${index + 1}: Missing Conference field - "${talk.title_of_paper}"`);
                }
                if (!talk.organized_by || talk.organized_by.trim() === '') {
                    missingOrganizedBy++;
                    console.log(`   Talk ${index + 1}: Missing Organized By field - "${talk.title_of_paper}"`);
                }
            });
        }

        console.log(`\n   Missing Conference fields: ${missingConference} out of ${professor.invited_talks?.length || 0}`);
        console.log(`   Missing Organized By fields: ${missingOrganizedBy} out of ${professor.invited_talks?.length || 0}`);

        // Analyze organized conferences
        console.log('\n📊 ORGANIZED CONFERENCES ANALYSIS:');
        console.log(`Total organized conferences: ${professor.conferences_seminars_workshops_organized?.length || 0}`);

        let missingTitle = 0;

        if (professor.conferences_seminars_workshops_organized) {
            professor.conferences_seminars_workshops_organized.forEach((conf, index) => {
                if (!conf.title_of_programme || conf.title_of_programme.trim() === '') {
                    missingTitle++;
                    console.log(`   Conference ${index + 1}: Missing Title - Sponsors: "${conf.sponsors}", Venue: "${conf.venue_duration}", Year: ${conf.year}`);
                }
            });
        }

        console.log(`\n   Missing Title fields: ${missingTitle} out of ${professor.conferences_seminars_workshops_organized?.length || 0}`);

        console.log('\n🎯 SUMMARY:');
        console.log(`   Invited Talks need ${missingConference} Conference fields and ${missingOrganizedBy} Organized By fields`);
        console.log(`   Organized Conferences need ${missingTitle} Title fields`);

    } catch (error) {
        console.error('❌ Analysis failed:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
    }
}

analyzeAllMissingData();