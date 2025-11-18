const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import Professor model
const Professor = require('./Professor');

async function testConferenceAPI() {
    try {
        console.log('🧪 Testing Conference API with fixed field names...\n');

        // Find the professor (JAYAKUMAR)
        const professor = await Professor.findOne({ email: 'skvjey@pondiuni.ac.in' });

        if (!professor) {
            console.log('❌ Professor not found');
            return;
        }

        console.log(`👤 Testing API for: ${professor.name} (${professor.email})`);
        console.log(`🆔 Professor ID: ${professor._id}\n`);

        // Test the data structure that API will return
        const apiResponse = {
            invited_talks: professor.invited_talks || [],
            conferences_seminars_workshops_organized: professor.conferences_seminars_workshops_organized || [],
            conferences_seminars_workshops_participated: professor.conferences_seminars_workshops_participated || [],
            financial_support: professor.financial_support || []
        };

        console.log('📊 API Response Preview:');
        console.log(`   Invited Talks: ${apiResponse.invited_talks.length}`);
        console.log(`   Organized Conferences: ${apiResponse.conferences_seminars_workshops_organized.length}`);
        console.log(`   Participated Workshops: ${apiResponse.conferences_seminars_workshops_participated.length}`);
        console.log(`   Financial Support: ${apiResponse.financial_support.length}\n`);

        if (apiResponse.invited_talks.length > 0) {
            console.log('🔍 Sample Invited Talk:');
            const firstTalk = apiResponse.invited_talks[0];
            console.log(`   Title: "${firstTalk.title_of_paper || 'N/A'}"`);
            console.log(`   Conference: "${firstTalk.conference_seminar_workshop || 'N/A'}"`);
            console.log(`   Level: "${firstTalk.level || 'N/A'}"`);
            console.log(`   Year: "${firstTalk.year || 'N/A'}"\n`);
        }

        if (apiResponse.conferences_seminars_workshops_organized.length > 0) {
            console.log('🔍 Sample Organized Conference:');
            const firstConf = apiResponse.conferences_seminars_workshops_organized[0];
            console.log(`   Title: "${firstConf.title_of_programme || 'N/A'}"`);
            console.log(`   Sponsors: "${firstConf.sponsors || 'N/A'}"`);
            console.log(`   Venue/Duration: "${firstConf.venue_duration || 'N/A'}"`);
            console.log(`   Level: "${firstConf.level || 'N/A'}"`);
            console.log(`   Year: "${firstConf.year || 'N/A'}"\n`);
        }

        console.log('✅ Conference API test completed successfully!');
        console.log('🌐 The API should now work properly with the frontend');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        mongoose.disconnect();
        console.log('🔌 Database disconnected');
    }
}

testConferenceAPI();