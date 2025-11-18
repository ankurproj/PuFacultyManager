// Check what publications data exists in the database
const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

async function checkPublicationsData() {
    try {
        console.log('🔍 Checking publications data in database...');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📊 Connected to database');

        // Find the professor
        const professor = await Professor.findOne({
            name: /JAYAKUMAR/i
        });

        if (!professor) {
            console.log('❌ Professor not found');
            return;
        }

        console.log(`\n👨‍🏫 Found professor: ${professor.name}`);
        console.log(`📧 Email: ${professor.email}`);

        // Check all possible publication fields
        console.log('\n📚 Publications Data Analysis:');

        // Check UGC papers
        console.log('\n🔬 UGC Papers:');
        console.log(`  ugc_papers: ${professor.ugc_papers?.length || 0} entries`);
        console.log(`  ugc_approved_journals: ${professor.ugc_approved_journals?.length || 0} entries`);

        if (professor.ugc_approved_journals?.length > 0) {
            console.log('  Sample UGC paper:', JSON.stringify(professor.ugc_approved_journals[0], null, 2));
        }

        // Check Non-UGC papers
        console.log('\n📖 Non-UGC Papers:');
        console.log(`  non_ugc_papers: ${professor.non_ugc_papers?.length || 0} entries`);
        console.log(`  non_ugc_journals: ${professor.non_ugc_journals?.length || 0} entries`);

        if (professor.non_ugc_journals?.length > 0) {
            console.log('  Sample Non-UGC paper:', JSON.stringify(professor.non_ugc_journals[0], null, 2));
        }

        // Check Conference papers
        console.log('\n🎤 Conference Papers:');
        console.log(`  conference_proceedings: ${professor.conference_proceedings?.length || 0} entries`);

        if (professor.conference_proceedings?.length > 0) {
            console.log('  Sample Conference paper:', JSON.stringify(professor.conference_proceedings[0], null, 2));
        }

        // Check new consolidated format
        console.log('\n📄 Consolidated Papers:');
        console.log(`  papers_published: ${professor.papers_published?.length || 0} entries`);

        if (professor.papers_published?.length > 0) {
            console.log('  Sample consolidated paper:', JSON.stringify(professor.papers_published[0], null, 2));
        }

        // Check the expected field names for frontend
        console.log('\n🔍 Field Analysis for Frontend Compatibility:');

        if (professor.ugc_approved_journals?.length > 0) {
            const sample = professor.ugc_approved_journals[0];
            console.log('\n  UGC Paper Fields:');
            Object.keys(sample).forEach(key => {
                console.log(`    ${key}: ${typeof sample[key]} = "${sample[key]}"`);
            });
        }

        if (professor.conference_proceedings?.length > 0) {
            const sample = professor.conference_proceedings[0];
            console.log('\n  Conference Paper Fields:');
            Object.keys(sample).forEach(key => {
                console.log(`    ${key}: ${typeof sample[key]} = "${sample[key]}"`);
            });
        }

        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

checkPublicationsData();