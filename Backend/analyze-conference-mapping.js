const mongoose = require('mongoose');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function analyzeConferenceDataMapping() {
    try {
        console.log('🔍 Analyzing conference data mapping issue...\n');

        // Read the scraped data
        const scrapedData = JSON.parse(fs.readFileSync('./scraped_data_941.json', 'utf8'));

        console.log('📊 SCRAPED DATA ANALYSIS:');
        console.log(`   Invited Talks: ${(scrapedData.conferences_seminars?.invited_talks || []).length}`);
        console.log(`   Organized Conferences: ${(scrapedData.conferences_seminars?.organized_conferences || []).length}`);
        console.log(`   Organized Workshops: ${(scrapedData.conferences_seminars?.organized_workshops || []).length}\n`);

        if (scrapedData.conferences_seminars?.organized_conferences?.length > 0) {
            console.log('🔍 Sample Organized Conference (scraped):');
            const conf = scrapedData.conferences_seminars.organized_conferences[0];
            console.log(`   Title: "${conf.title_of_programme || 'N/A'}"`);
            console.log(`   Sponsors: "${conf.sponsors || 'N/A'}"`);
            console.log(`   Venue: "${conf.venue_duration || 'N/A'}"`);
            console.log(`   Level: "${conf.level || 'N/A'}"`);
            console.log(`   Year: "${conf.year || 'N/A'}"\n`);
        }

        if (scrapedData.conferences_seminars?.organized_workshops?.length > 0) {
            console.log('🔍 Sample Organized Workshop (scraped):');
            const workshop = scrapedData.conferences_seminars.organized_workshops[0];
            console.log(`   Title: "${workshop.title_of_programme || 'N/A'}"`);
            console.log(`   Sponsors: "${workshop.sponsors || 'N/A'}"`);
            console.log(`   Venue: "${workshop.venue_duration || 'N/A'}"`);
            console.log(`   Level: "${workshop.level || 'N/A'}"`);
            console.log(`   Year: "${workshop.year || 'N/A'}"\n`);
        }

        console.log('❌ CURRENT MAPPING (INCORRECT):');
        console.log('   conferences_seminars_workshops_organized ← organized_conferences (12 items)');
        console.log('   conferences_seminars_workshops_participated ← organized_workshops (11 items) [WRONG!]\n');

        console.log('✅ CORRECT MAPPING SHOULD BE:');
        console.log('   conferences_seminars_workshops_organized ← organized_conferences + organized_workshops (23 items total)');
        console.log('   conferences_seminars_workshops_participated ← (should be empty or have actual participated data)\n');

        console.log('🔧 SOLUTION: Combine organized_conferences and organized_workshops into conferences_seminars_workshops_organized');

    } catch (error) {
        console.error('❌ Analysis failed:', error);
    } finally {
        mongoose.disconnect();
    }
}

analyzeConferenceDataMapping();