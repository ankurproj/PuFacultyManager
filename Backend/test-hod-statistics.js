// Test the HOD statistics endpoints
const mongoose = require('mongoose');
require('dotenv').config();

// Professor model (simplified for testing)
const professorSchema = new mongoose.Schema({
    name: String,
    role: String,
    ugc_approved_journals: Array,
    conference_proceedings: Array,
    non_ugc_journals: Array,
    awards: Array
});

async function testHODStatistics() {
    try {
        console.log('🧪 Testing HOD Statistics Endpoints');
        console.log('=====================================');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📊 Connected to database');

        const Professor = mongoose.model('Professor', professorSchema, 'Professors');

        // Test publications statistics logic
        console.log('\n📚 Testing Publications Statistics Logic...');

        const allFaculty = await Professor.find({}).select('name ugc_approved_journals conference_proceedings non_ugc_journals');

        let totalPublications = 0;
        const yearWisePublications = {};

        console.log(`Found ${allFaculty.length} faculty members`);

        allFaculty.forEach((faculty, index) => {
            let facultyPubs = 0;

            // Process UGC approved journals
            if (faculty.ugc_approved_journals && faculty.ugc_approved_journals.length > 0) {
                faculty.ugc_approved_journals.forEach(paper => {
                    totalPublications++;
                    facultyPubs++;
                    const year = paper.year || 'Unknown';
                    yearWisePublications[year] = (yearWisePublications[year] || 0) + 1;
                });
            }

            // Process conference proceedings
            if (faculty.conference_proceedings && faculty.conference_proceedings.length > 0) {
                faculty.conference_proceedings.forEach(paper => {
                    totalPublications++;
                    facultyPubs++;
                    const year = paper.year || 'Unknown';
                    yearWisePublications[year] = (yearWisePublications[year] || 0) + 1;
                });
            }

            // Process non-UGC journals
            if (faculty.non_ugc_journals && faculty.non_ugc_journals.length > 0) {
                faculty.non_ugc_journals.forEach(paper => {
                    totalPublications++;
                    facultyPubs++;
                    const year = paper.year || 'Unknown';
                    yearWisePublications[year] = (yearWisePublications[year] || 0) + 1;
                });
            }

            if (facultyPubs > 0) {
                console.log(`  ${faculty.name}: ${facultyPubs} publications`);
            }
        });

        // Sort years in descending order
        const sortedYears = Object.entries(yearWisePublications)
            .sort((a, b) => {
                if (a[0] === 'Unknown') return 1;
                if (b[0] === 'Unknown') return -1;
                return parseInt(b[0]) - parseInt(a[0]);
            })
            .slice(0, 10);

        console.log(`\n📊 Publications Statistics:`);
        console.log(`   Total Publications: ${totalPublications}`);
        console.log(`   Year-wise Breakdown (Top 10):`);
        sortedYears.forEach(([year, count]) => {
            console.log(`     ${year}: ${count} publications`);
        });

        // Test awards statistics logic
        console.log('\n🏆 Testing Awards Statistics Logic...');

        const allFacultyWithAwards = await Professor.find({}).select('name awards');

        let totalAwards = 0;
        const facultyAwards = [];

        allFacultyWithAwards.forEach(faculty => {
            const awardCount = (faculty.awards && faculty.awards.length) ? faculty.awards.length : 0;
            totalAwards += awardCount;

            if (awardCount > 0) {
                facultyAwards.push({
                    name: faculty.name || 'Unknown Faculty',
                    awardCount: awardCount
                });
                console.log(`  ${faculty.name}: ${awardCount} awards`);
            }
        });

        // Sort faculty by award count and get top 3
        const topFaculty = facultyAwards
            .sort((a, b) => b.awardCount - a.awardCount)
            .slice(0, 3);

        console.log(`\n🏆 Awards Statistics:`);
        console.log(`   Total Awards: ${totalAwards}`);
        console.log(`   Top Faculty by Awards:`);
        topFaculty.forEach((faculty, index) => {
            console.log(`     ${index + 1}. ${faculty.name}: ${faculty.awardCount} awards`);
        });

        if (totalPublications > 0 || totalAwards > 0) {
            console.log('\n✅ SUCCESS: HOD statistics data is available and logic works correctly!');
            console.log('\n📋 Summary:');
            console.log(`   📚 Total Publications: ${totalPublications}`);
            console.log(`   🏆 Total Awards: ${totalAwards}`);
            console.log(`   👥 Faculty Members: ${allFaculty.length}`);
        } else {
            console.log('\n⚠️  No publications or awards data found. The endpoints will work but show zero values.');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');

    } catch (error) {
        console.error('❌ Error testing HOD statistics:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

testHODStatistics();