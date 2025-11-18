// Complete test to update professor with corrected research experience mapping
const mongoose = require('mongoose');
const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');
const Professor = require('./Professor');
require('dotenv').config();

async function updateResearchExperienceMapping() {
    try {
        console.log('🚀 Starting complete research experience field mapping test...');

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
        console.log(`📧 Email: ${existingProfessor.email}`);

        // Test the scraping with our fixed logic
        console.log('\n🔍 Testing updated scraper...');

        const facultyUrl = 'https://www.pondiuni.edu.in/profile/dr-s-k-v-jayakumar';
        const scraper = new FacultyDataScraper();

        // Extract research experience with our corrected scraper
        const researchData = await scraper.extractResearchExperience(facultyUrl);

        console.log('\n📋 Scraped Research Experience Data:');
        console.log(JSON.stringify(researchData, null, 2));

        // Transform the data with our corrected transformer
        const transformer = new DataTransformer();
        const transformedData = transformer.transformResearchExperience(researchData);

        console.log('\n🔄 Transformed Research Experience Data:');
        console.log(JSON.stringify(transformedData, null, 2));

        // Verify the mapping is correct
        if (transformedData.length > 0 && transformedData[0].project) {
            console.log('\n✅ FIELD MAPPING VERIFICATION:');
            console.log(`   Project/Research Area: "${transformedData[0].project}"`);

            if (transformedData[0].project.includes('Services Computing')) {
                console.log('   🎉 SUCCESS: "Services Computing" correctly mapped to project field!');
            }
        }

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

        console.log(`✅ Update result: ${updateResult.modifiedCount} record(s) modified`);

        // Verify the update worked
        const updatedProfessor = await Professor.findById(existingProfessor._id);

        console.log('\n🔍 VERIFICATION - Database Record After Update:');
        if (updatedProfessor.research_experience && updatedProfessor.research_experience.length > 0) {
            updatedProfessor.research_experience.forEach((exp, index) => {
                console.log(`\n   ${index + 1}. Designation: ${exp.designation || 'N/A'}`);
                console.log(`      Institution: ${exp.institution || 'N/A'}`);
                console.log(`      Project/Research Area: ${exp.project || 'N/A'}`);
                console.log(`      Duration: ${exp.duration || 'N/A'}`);
            });

            const hasCorrectMapping = updatedProfessor.research_experience.some(exp =>
                exp.project && exp.project.includes('Services Computing')
            );

            if (hasCorrectMapping) {
                console.log('\n🎊 COMPLETE SUCCESS! Research experience field mapping is now working correctly!');
                console.log('   ✅ Scraper extracts "Area of Research" as areaOfResearch');
                console.log('   ✅ Transformer maps areaOfResearch to project field');
                console.log('   ✅ Database stores "Services Computing" in project field');
                console.log('   ✅ Frontend Experience page will now show correct data in Project/Research Area column');
                console.log('\n🌐 Next step: Visit http://localhost:3000/experience to see the fix in action!');
            } else {
                console.log('\n⚠️  Update completed but "Services Computing" not found in project field');
            }
        } else {
            console.log('\n❌ No research experience found after update');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        await mongoose.disconnect();
        process.exit(1);
    }
}

updateResearchExperienceMapping();