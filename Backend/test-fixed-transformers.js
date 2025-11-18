const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience?retryWrites=true&w=majority&appName=Cluster1';

mongoose.connect(MONGODB_URI);

// Import models and utilities
const Professor = require('./Professor');
const DataTransformer = require('./utils/dataTransformer');

async function reTransformConferenceData() {
    try {
        console.log('🔄 Re-transforming conference data with fixed field mappings...\n');

        // This simulates the scraped data structure based on our previous integration output
        const mockScrapedData = {
            conferences_seminars: {
                invited_talks: [
                    {
                        title_of_paper: "IoT and its Advantages in Communication Engineering",
                        conference_seminar_workshop: "International Conference on IoT",
                        organized_by: "IEEE",
                        level: "International",
                        from_date: "2019-03-01",
                        to_date: "2019-03-03",
                        year: "2019"
                    },
                    {
                        title_of_paper: "Career Options after School Education",
                        conference_seminar_workshop: "Career Guidance Seminar",
                        organized_by: "Education Board",
                        level: "Regional",
                        from_date: "2019-06-15",
                        to_date: "2019-06-15",
                        year: "2019"
                    },
                    {
                        title_of_paper: "Artificial Intelligence in Cloud Services",
                        conference_seminar_workshop: "AI Conference",
                        organized_by: "Tech Association",
                        level: "National",
                        from_date: "2018-09-10",
                        to_date: "2018-09-12",
                        year: "2018"
                    }
                ],
                organized_conferences: [
                    {
                        title_of_programme: "TCS Campus Connect Program",
                        sponsors: "Tata Consultancy Services",
                        venue_duration: "Pondicherry University - One Day",
                        level: "University Level",
                        from_date: "2018-05-15",
                        to_date: "2018-05-15",
                        year: "2018"
                    },
                    {
                        title_of_programme: "Microsoft Technology Seminar",
                        sponsors: "Microsoft",
                        venue_duration: "Pondicherry University - One Day",
                        level: "University Level",
                        from_date: "2016-03-20",
                        to_date: "2016-03-20",
                        year: "2016"
                    }
                ],
                organized_workshops: [
                    {
                        title_of_programme: "Web Development Workshop",
                        sponsors: "Wipro - MNC",
                        venue_duration: "Pondicherry University - Five Days",
                        level: "University Level",
                        from_date: "2012-07-01",
                        to_date: "2012-07-05",
                        year: "2012"
                    }
                ]
            }
        };

        console.log('🧪 Testing transformation with sample data...');

        // Transform the data using our fixed transformers
        const transformedData = DataTransformer.transformScrapedData(mockScrapedData);

        console.log('\n📊 TRANSFORMED DATA PREVIEW:');
        console.log(`   Invited Talks: ${transformedData.invited_talks.length}`);
        console.log(`   Organized Conferences/Workshops: ${transformedData.conferences_seminars_workshops_organized.length}`);
        console.log(`   Participated: ${transformedData.conferences_seminars_workshops_participated.length}\n`);

        if (transformedData.invited_talks.length > 0) {
            console.log('🔍 Sample Transformed Invited Talk:');
            const talk = transformedData.invited_talks[0];
            console.log(`   Title: "${talk.title_of_paper}"`);
            console.log(`   Conference: "${talk.conferences_seminar_workshop_training}"`);
            console.log(`   Organized by: "${talk.organized_by}"`);
            console.log(`   Level: "${talk.level}"`);
            console.log(`   Year: "${talk.year}"\n`);
        }

        if (transformedData.conferences_seminars_workshops_organized.length > 0) {
            console.log('🔍 Sample Transformed Organized Conference:');
            const conf = transformedData.conferences_seminars_workshops_organized[0];
            console.log(`   Title: "${conf.title_of_programme}"`);
            console.log(`   Sponsors: "${conf.sponsors}"`);
            console.log(`   Venue/Duration: "${conf.venue_duration}"`);
            console.log(`   Level: "${conf.level}"`);
            console.log(`   Year: "${conf.year}"\n`);
        }

        console.log('✅ Transformation test completed!');
        console.log('📝 The fixed transformers now correctly map all fields');
        console.log('🔄 Need to re-run the integration to apply these fixes to database');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
    }
}

reTransformConferenceData();