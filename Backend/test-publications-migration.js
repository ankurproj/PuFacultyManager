// Test updating an existing professor with new publications format
const mongoose = require('mongoose');
const DataTransformer = require('./utils/dataTransformer');
const Professor = require('./Professor');
require('dotenv').config();

async function testPublicationsMigration() {
    try {
        console.log('🔄 Testing Publications Migration for Existing Professor');
        console.log('=====================================================');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📊 Connected to database');

        // Find an existing professor with publications
        const professor = await Professor.findOne({
            $or: [
                { ugc_approved_journals: { $exists: true, $ne: [] } },
                { non_ugc_journals: { $exists: true, $ne: [] } }
            ]
        });

        if (!professor) {
            console.log('⚠️  No professor found with existing publications');
            await mongoose.disconnect();
            return;
        }

        console.log(`\n👨‍🏫 Found professor: ${professor.name}`);
        console.log(`📚 UGC Journals: ${professor.ugc_approved_journals?.length || 0}`);
        console.log(`📰 Non-UGC Journals: ${professor.non_ugc_journals?.length || 0}`);
        console.log(`📄 Papers Published (new format): ${professor.papers_published?.length || 0}`);

        // Check if we need to migrate
        if (professor.papers_published && professor.papers_published.length > 0) {
            console.log('\n✅ Professor already has new format data');

            // Check the format of existing data
            const samplePaper = professor.papers_published[0];
            console.log('\n📋 Sample paper format:');
            console.log(`  Title: ${samplePaper.title}`);
            console.log(`  Type: ${samplePaper.paper_type || 'Not set'}`);
            console.log(`  Co-authors (Within): "${samplePaper.coauthors_within_org || 'Not set'}"`);
            console.log(`  Co-authors (Outside): "${samplePaper.coauthors_outside_org || 'Not set'}"`);
            console.log(`  Paper Link: "${samplePaper.paper_link || 'Not set'}"`);

        } else if (professor.ugc_approved_journals?.length > 0 || professor.non_ugc_journals?.length > 0) {
            console.log('\n🔄 Migrating legacy data to new format...');

            // Create new format data from existing legacy data
            const ugcPapers = (professor.ugc_approved_journals || []).map(paper => ({
                title: paper.title || '',
                coauthors_within_org: '',
                coauthors_outside_org: '',
                journal_name: paper.journal_name || '',
                volume: paper.volume || '',
                issue: paper.issue || '',
                page_nos: paper.page_nos || '',
                year: paper.year || '',
                impact_factor: paper.impact_factor || '',
                paper_upload: paper.paper_upload || '',
                paper_upload_filename: paper.paper_upload_filename || '',
                paper_link: '',
                paper_type: 'UGC',
                conference_details: ''
            }));

            const nonUgcPapers = (professor.non_ugc_journals || []).map(paper => ({
                title: paper.title || '',
                coauthors_within_org: '',
                coauthors_outside_org: '',
                journal_name: paper.journal_name || '',
                volume: paper.volume || '',
                issue: paper.issue || '',
                page_nos: paper.page_nos || '',
                year: paper.year || '',
                impact_factor: paper.impact_factor || '',
                paper_upload: paper.paper_upload || '',
                paper_upload_filename: paper.paper_upload_filename || '',
                paper_link: '',
                paper_type: 'Scopus',
                conference_details: ''
            }));

            const allPapersPublished = [...ugcPapers, ...nonUgcPapers];

            // Update the professor record
            const updateResult = await Professor.updateOne(
                { _id: professor._id },
                { $set: { papers_published: allPapersPublished } }
            );

            console.log(`✅ Migration completed: ${updateResult.modifiedCount} record updated`);
            console.log(`📄 New papers_published array has ${allPapersPublished.length} papers`);

            // Verify the migration
            const updatedProfessor = await Professor.findById(professor._id);
            if (updatedProfessor.papers_published?.length > 0) {
                console.log('\n🔍 Migration Verification:');
                const ugcCount = updatedProfessor.papers_published.filter(p => p.paper_type === 'UGC').length;
                const scopusCount = updatedProfessor.papers_published.filter(p => p.paper_type === 'Scopus').length;
                console.log(`  UGC papers: ${ugcCount}`);
                console.log(`  Scopus papers: ${scopusCount}`);
                console.log(`  Total papers: ${updatedProfessor.papers_published.length}`);

                console.log('\n🎉 Migration successful! The publications page will now show:');
                console.log('  ✅ UGC papers marked as "UGC" in type dropdown');
                console.log('  ✅ Non-UGC papers marked as "Scopus" in type dropdown');
                console.log('  ✅ Co-authors columns blank for scraped data');
                console.log('  ✅ Paper links blank for existing data');
                console.log('  ✅ Rest of data preserved (title, journal, volume, etc.)');
            }
        } else {
            console.log('\n📝 No publications found to migrate');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');

    } catch (error) {
        console.error('❌ Error during migration test:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

testPublicationsMigration();