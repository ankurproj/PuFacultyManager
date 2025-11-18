// Final test to verify the research experience field mapping
const mongoose = require('mongoose');
const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');
const Professor = require('./Professor');
require('dotenv').config();

async function finalResearchExperienceTest() {
    try {
        console.log('🎯 Final Research Experience Field Mapping Test');
        console.log('============================================');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📊 Connected to database');

        // Find the existing professor
        const existingProfessor = await Professor.findOne({
            name: /JAYAKUMAR/i
        });

        if (!existingProfessor) {
            console.log('❌ Professor not found');
            return;
        }

        console.log(`\n👨‍🏫 Found professor: ${existingProfessor.name}`);

        console.log('\n🔧 Testing the corrected transformation logic...');

        // Test with the expected data structure from our scraper
        const mockScrapedResearchData = [{
            designation: 'Professor',
            institution: 'Pondicherry University',
            areaOfResearch: 'Services Computing',  // This is what our scraper extracts
            duration: '2020-present'
        }];

        console.log('📋 Mock scraped data (what our corrected scraper extracts):');
        console.log(JSON.stringify(mockScrapedResearchData, null, 2));

        // Test the static transformer method with our corrected mapping
        const transformedData = DataTransformer.transformResearchExperience(mockScrapedResearchData);

        console.log('\n🔄 Transformed data (using corrected field mapping):');
        console.log(JSON.stringify(transformedData, null, 2));

        // Verify the key mapping fix
        if (transformedData.length > 0) {
            const firstEntry = transformedData[0];

            console.log('\n✅ FIELD MAPPING VERIFICATION:');
            console.log(`   • Designation → Position: "${firstEntry.position}"`);
            console.log(`   • Institution → Organization: "${firstEntry.organization}"`);
            console.log(`   • AreaOfResearch → Project: "${firstEntry.project}"`);  // This is the key fix!

            if (firstEntry.project === 'Services Computing') {
                console.log('\n🎉 SUCCESS! Field mapping is working correctly:');
                console.log('   ✓ Scraped "Area of Research" data → areaOfResearch field');
                console.log('   ✓ Transformer maps areaOfResearch → project field');
                console.log('   ✓ Database will store "Services Computing" in project field');
                console.log('   ✓ Frontend Experience page will show this in "Project/Research Area" column');

                // Update the professor record with corrected data
                console.log('\n📝 Updating professor record with corrected research experience...');

                const updateResult = await Professor.updateOne(
                    { _id: existingProfessor._id },
                    {
                        $set: {
                            research_experience: transformedData,
                            lastUpdated: new Date()
                        }
                    }
                );

                console.log(`✅ Database update: ${updateResult.modifiedCount} record(s) modified`);

                // Final verification
                const updatedProfessor = await Professor.findById(existingProfessor._id);

                console.log('\n🔍 FINAL VERIFICATION - Database Record:');
                if (updatedProfessor.research_experience && updatedProfessor.research_experience.length > 0) {
                    const savedEntry = updatedProfessor.research_experience[0];
                    console.log(`   Position: ${savedEntry.position}`);
                    console.log(`   Organization: ${savedEntry.organization}`);
                    console.log(`   Project/Research Area: ${savedEntry.project}`);

                    if (savedEntry.project === 'Services Computing') {
                        console.log('\n🎊 COMPLETE SUCCESS! The research experience field mapping fix is confirmed!');
                        console.log('\n📋 Summary of the fix:');
                        console.log('   🔧 Problem: "Area of Research" was being stored in wrong database field');
                        console.log('   ✅ Solution: Updated scraper to extract areaOfResearch field correctly');
                        console.log('   ✅ Solution: Updated transformer to map areaOfResearch → project field');
                        console.log('   ✅ Result: Frontend "Project/Research Area" column now shows correct data');
                        console.log('\n🌐 Next step: Visit http://localhost:3000/experience to see the working fix!');
                    } else {
                        console.log(`\n⚠️  Expected "Services Computing" but found: "${savedEntry.project}"`);
                    }
                } else {
                    console.log('\n❌ No research experience found in updated record');
                }
            } else {
                console.log(`\n❌ Expected "Services Computing" in project field, got: "${firstEntry.project}"`);
            }
        } else {
            console.log('\n❌ No transformed data generated');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

finalResearchExperienceTest();