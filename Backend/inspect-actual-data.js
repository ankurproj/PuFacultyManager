const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience?retryWrites=true&w=majority&appName=Cluster1';

mongoose.connect(MONGODB_URI);

// Import Professor model
const Professor = require('./Professor');

async function inspectActualData() {
    try {
        console.log('🔍 Inspecting actual conference data in database...\n');

        // Find the professor (JAYAKUMAR)
        const professor = await Professor.findOne({ email: 'skvjey@pondiuni.ac.in' });

        if (!professor) {
            console.log('❌ Professor not found');
            return;
        }

        console.log(`👤 Inspecting data for: ${professor.name} (${professor.email})`);

        console.log('\n🔍 INVITED TALKS DATA STRUCTURE:');
        if (professor.invited_talks && professor.invited_talks.length > 0) {
            console.log('   Sample invited talk object:');
            console.log('  ', JSON.stringify(professor.invited_talks[0], null, 4));

            console.log('\n   Available fields in invited talks:');
            console.log('   -', Object.keys(professor.invited_talks[0]).join('\n   - '));
        } else {
            console.log('   No invited talks found');
        }

        console.log('\n🔍 ORGANIZED CONFERENCES DATA STRUCTURE:');
        if (professor.conferences_seminars_workshops_organized && professor.conferences_seminars_workshops_organized.length > 0) {
            console.log('   Sample organized conference object:');
            console.log('  ', JSON.stringify(professor.conferences_seminars_workshops_organized[0], null, 4));

            console.log('\n   Available fields in organized conferences:');
            console.log('   -', Object.keys(professor.conferences_seminars_workshops_organized[0]).join('\n   - '));
        } else {
            console.log('   No organized conferences found');
        }

        console.log('\n📊 SUMMARY:');
        console.log(`   Invited talks count: ${professor.invited_talks?.length || 0}`);
        console.log(`   Organized conferences count: ${professor.conferences_seminars_workshops_organized?.length || 0}`);
        console.log(`   Participated workshops count: ${professor.conferences_seminars_workshops_participated?.length || 0}`);

    } catch (error) {
        console.error('❌ Inspection failed:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
    }
}

inspectActualData();