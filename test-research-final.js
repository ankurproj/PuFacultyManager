// Test the research experience field mapping by updating existing professor
const { connectToDatabase } = require('./Backend/db/mongoose');
const FacultyDataScraper = require('./Backend/scrapers/facultyDataScraper');
const DataTransformer = require('./Backend/utils/dataTransformer');

async function testResearchExperienceUpdate() {
    try {
        console.log('🔍 Testing research experience field mapping...');

        // Connect to database
        const db = await connectToDatabase();

        // Define test faculty URL (Dr. SKV Jayakumar)
        const facultyUrl = 'https://www.pondiuni.edu.in/profile/dr-s-k-v-jayakumar';

        console.log('📊 Scraping research experience data...');

        // Initialize scraper
        const scraper = new FacultyDataScraper();

        // Extract only research experience for testing
        const researchData = await scraper.extractResearchExperience(facultyUrl);

        console.log('\n📋 Scraped Research Experience Data:');
        console.log(JSON.stringify(researchData, null, 2));

        // Transform the data
        const transformer = new DataTransformer();
        const transformedData = transformer.transformResearchExperience(researchData);

        console.log('\n🔄 Transformed Research Experience Data:');
        console.log(JSON.stringify(transformedData, null, 2));

        // Check if the mapping is correct
        if (transformedData.length > 0) {
            const firstEntry = transformedData[0];
            console.log('\n✅ Field Mapping Verification:');
            console.log(`• Designation: ${firstEntry.designation || 'Not found'}`);
            console.log(`• Institution: ${firstEntry.institution || 'Not found'}`);
            console.log(`• Project/Research Area: ${firstEntry.project || 'Not found'}`);
            console.log(`• Duration: ${firstEntry.duration || 'Not found'}`);

            if (firstEntry.project && firstEntry.project.includes('Services Computing')) {
                console.log('\n🎉 SUCCESS: "Area of Research" is now correctly mapped to "project" field!');
                console.log('   The frontend Experience page will show "Services Computing" in the Project/Research Area column.');
            } else {
                console.log('\n⚠️  WARNING: Expected "Services Computing" in project field, but got:', firstEntry.project);
            }
        } else {
            console.log('\n❌ No research experience data found');
        }

        // Find existing professor to update
        const Professor = db.model('Professor');
        let existingProfessor = await Professor.findOne({
            $or: [
                { email: 'skvjey@gmail.com' },
                { name: /jayakumar/i }
            ]
        });

        if (existingProfessor) {
            console.log('\n📝 Updating existing professor record...');

            // Update just the research experience field
            const updateResult = await Professor.updateOne(
                { _id: existingProfessor._id },
                {
                    $set: {
                        research_experience: transformedData,
                        lastUpdated: new Date()
                    }
                },
                { upsert: false }
            );

            console.log('\n✅ Professor record updated successfully!');
            console.log(`   Modified count: ${updateResult.modifiedCount}`);

            // Verify the update
            const updatedProfessor = await Professor.findById(existingProfessor._id);
            if (updatedProfessor.research_experience && updatedProfessor.research_experience.length > 0) {
                const updatedResearch = updatedProfessor.research_experience[0];
                console.log('\n🔍 Verification - Updated Database Record:');
                console.log(`   Project/Research Area: ${updatedResearch.project || 'Not found'}`);

                if (updatedResearch.project && updatedResearch.project.includes('Services Computing')) {
                    console.log('\n🎊 COMPLETE SUCCESS: Research experience field mapping is working correctly!');
                    console.log('   ✓ Scraper extracts "Area of Research" as areaOfResearch');
                    console.log('   ✓ Transformer maps areaOfResearch to project field');
                    console.log('   ✓ Database stores "Services Computing" in project field');
                    console.log('   ✓ Frontend will display this in Project/Research Area column');
                } else {
                    console.log('\n❌ Database verification failed - project field not updated correctly');
                }
            } else {
                console.log('\n❌ No research experience found in updated record');
            }

        } else {
            console.log('\n⚠️  No existing professor found to update');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error testing research experience update:', error.message);
        process.exit(1);
    }
}

// Run the test
testResearchExperienceUpdate();