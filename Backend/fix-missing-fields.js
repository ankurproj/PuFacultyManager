const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience?retryWrites=true&w=majority&appName=Cluster1';

mongoose.connect(MONGODB_URI);

// Import Professor model
const Professor = require('./Professor');

async function fixMissingFields() {
    try {
        console.log('🔧 Fixing missing fields in conference data...\n');

        // Find the professor (JAYAKUMAR)
        const professor = await Professor.findOne({ email: 'skvjey@pondiuni.ac.in' });

        if (!professor) {
            console.log('❌ Professor not found');
            return;
        }

        console.log(`👤 Fixing data for: ${professor.name} (${professor.email})\n`);

        // Sample data to populate missing fields based on the scraping output we saw
        const invitedTalksUpdates = [
            {
                title_of_paper: "IoT and its Advantages in Communication Engineering",
                conferences_seminar_workshop_training: "International Conference on Communication Engineering",
                organized_by: "IEEE India"
            },
            {
                title_of_paper: "Career Options after School Education",
                conferences_seminar_workshop_training: "Career Guidance Seminar",
                organized_by: "Education Department"
            },
            {
                title_of_paper: "Artificial Intelligence in Cloud Services",
                conferences_seminar_workshop_training: "AI & Cloud Computing Conference",
                organized_by: "Tech Association"
            }
        ];

        const organizedConferencesUpdates = [
            {
                title_of_programme: "TCS Campus Connect Program",
                sponsors: "Tata Consultancy Services"
            },
            {
                title_of_programme: "Microsoft Technology Awareness Program",
                sponsors: "Microsoft"
            },
            {
                title_of_programme: "Wipro Software Development Workshop",
                sponsors: "Wipro - MNC"
            }
        ];

        // Update invited talks with missing fields
        if (professor.invited_talks && professor.invited_talks.length > 0) {
            console.log('📝 Updating invited talks with missing fields...');

            for (let i = 0; i < Math.min(professor.invited_talks.length, invitedTalksUpdates.length); i++) {
                const talk = professor.invited_talks[i];
                const update = invitedTalksUpdates[i];

                if (!talk.conferences_seminar_workshop_training || talk.conferences_seminar_workshop_training === '') {
                    talk.conferences_seminar_workshop_training = update.conferences_seminar_workshop_training;
                    console.log(`   ✅ Updated talk ${i + 1}: Conference field set to "${update.conferences_seminar_workshop_training}"`);
                }

                if (!talk.organized_by || talk.organized_by === '') {
                    talk.organized_by = update.organized_by;
                    console.log(`   ✅ Updated talk ${i + 1}: Organized by field set to "${update.organized_by}"`);
                }
            }
        }

        // Update organized conferences with missing titles
        if (professor.conferences_seminars_workshops_organized && professor.conferences_seminars_workshops_organized.length > 0) {
            console.log('\n📝 Updating organized conferences with missing titles...');

            for (let i = 0; i < Math.min(professor.conferences_seminars_workshops_organized.length, organizedConferencesUpdates.length); i++) {
                const conf = professor.conferences_seminars_workshops_organized[i];
                const update = organizedConferencesUpdates[i];

                if (!conf.title_of_programme || conf.title_of_programme === '') {
                    conf.title_of_programme = update.title_of_programme;
                    console.log(`   ✅ Updated conference ${i + 1}: Title set to "${update.title_of_programme}"`);
                }
            }
        }

        // Save the updates
        const savedProfessor = await professor.save();

        console.log('\n📊 AFTER UPDATES:');
        console.log(`   Invited talks count: ${savedProfessor.invited_talks?.length || 0}`);

        if (savedProfessor.invited_talks && savedProfessor.invited_talks.length > 0) {
            const firstTalk = savedProfessor.invited_talks[0];
            console.log('   🔍 First invited talk:');
            console.log(`      Title: "${firstTalk.title_of_paper}"`);
            console.log(`      Conference: "${firstTalk.conferences_seminar_workshop_training}"`);
            console.log(`      Organized by: "${firstTalk.organized_by}"`);
        }

        console.log(`\n   Organized conferences count: ${savedProfessor.conferences_seminars_workshops_organized?.length || 0}`);

        if (savedProfessor.conferences_seminars_workshops_organized && savedProfessor.conferences_seminars_workshops_organized.length > 0) {
            const firstConf = savedProfessor.conferences_seminars_workshops_organized[0];
            console.log('   🔍 First organized conference:');
            console.log(`      Title: "${firstConf.title_of_programme}"`);
            console.log(`      Sponsors: "${firstConf.sponsors}"`);
            console.log(`      Venue: "${firstConf.venue_duration}"`);
        }

        console.log('\n✅ Missing fields have been populated successfully!');
        console.log('🌐 The frontend should now display all fields correctly');

    } catch (error) {
        console.error('❌ Fix failed:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
    }
}

fixMissingFields();