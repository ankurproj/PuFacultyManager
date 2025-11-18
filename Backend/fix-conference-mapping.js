const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Import Professor model
const Professor = require('./Professor');

async function fixConferenceDataMapping() {
    try {
        console.log('🔧 Fixing conference data mapping...\n');

        // Find the professor (JAYAKUMAR)
        const professor = await Professor.findOne({ email: 'skvjey@pondiuni.ac.in' });

        if (!professor) {
            console.log('❌ Professor not found');
            return;
        }

        console.log(`👤 Fixing data for: ${professor.name} (${professor.email})`);
        console.log(`🆔 Professor ID: ${professor._id}\n`);

        console.log('📊 BEFORE FIX:');
        console.log(`   Invited Talks: ${professor.invited_talks?.length || 0}`);
        console.log(`   Organized Conferences: ${professor.conferences_seminars_workshops_organized?.length || 0}`);
        console.log(`   Participated Workshops: ${professor.conferences_seminars_workshops_participated?.length || 0}\n`);

        // Move the incorrectly placed workshop data from "participated" to "organized"
        const currentOrganized = professor.conferences_seminars_workshops_organized || [];
        const incorrectlyPlacedWorkshops = professor.conferences_seminars_workshops_participated || [];

        // Combine conferences and workshops into the organized section
        const combinedOrganized = [...currentOrganized, ...incorrectlyPlacedWorkshops];

        // Update the professor with fixed mapping
        const updatedProfessor = await Professor.findByIdAndUpdate(
            professor._id,
            {
                conferences_seminars_workshops_organized: combinedOrganized,
                conferences_seminars_workshops_participated: [] // Clear the incorrectly placed data
            },
            { new: true, runValidators: true }
        );

        console.log('📊 AFTER FIX:');
        console.log(`   Invited Talks: ${updatedProfessor.invited_talks?.length || 0}`);
        console.log(`   Organized Conferences/Workshops: ${updatedProfessor.conferences_seminars_workshops_organized?.length || 0}`);
        console.log(`   Participated Workshops: ${updatedProfessor.conferences_seminars_workshops_participated?.length || 0}\n`);

        if (combinedOrganized.length > 0) {
            console.log('🔍 Sample entries in organized section:');
            console.log(`   First item: "${combinedOrganized[0].title_of_programme || 'N/A'}" (${combinedOrganized[0].year || 'N/A'})`);
            if (combinedOrganized.length > 1) {
                console.log(`   Last item: "${combinedOrganized[combinedOrganized.length-1].title_of_programme || 'N/A'}" (${combinedOrganized[combinedOrganized.length-1].year || 'N/A'})`);
            }
            console.log();
        }

        console.log('✅ Conference data mapping fixed successfully!');
        console.log('📝 Now "Conferences/Seminars/Workshops Organized" contains both conferences and workshops');
        console.log('📝 "Conferences/Seminars/Workshops Participated" is empty (ready for actual participation data)');

    } catch (error) {
        console.error('❌ Fix failed:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
    }
}

fixConferenceDataMapping();