// Direct MongoDB migration to add frontend-expected fields
const mongoose = require('mongoose');
require('dotenv').config();

async function directFieldMigration() {
    try {
        console.log('🔄 Direct MongoDB field migration for publications...');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📊 Connected to database');

        const db = mongoose.connection.db;
        const collection = db.collection('professors');

        // Find the professor
        const professor = await collection.findOne({
            name: /JAYAKUMAR/i
        });

        if (!professor) {
            console.log('❌ Professor not found');
            return;
        }

        console.log(`\n👨‍🏫 Found professor: ${professor.name}`);

        // Prepare update operations
        const updateOps = {};

        // Migrate UGC papers
        if (professor.ugc_approved_journals && professor.ugc_approved_journals.length > 0) {
            console.log('\n🔬 Processing UGC papers...');
            updateOps.ugc_approved_journals = professor.ugc_approved_journals.map(paper => ({
                ...paper,
                coauthors_within_org: paper.authors || '',
                coauthors_outside_org: ''
            }));
            console.log(`  • Updated ${updateOps.ugc_approved_journals.length} UGC papers`);
        }

        // Migrate Non-UGC papers
        if (professor.non_ugc_journals && professor.non_ugc_journals.length > 0) {
            console.log('\n📖 Processing Non-UGC papers...');
            updateOps.non_ugc_journals = professor.non_ugc_journals.map(paper => ({
                ...paper,
                coauthors_within_org: paper.authors || '',
                coauthors_outside_org: ''
            }));
            console.log(`  • Updated ${updateOps.non_ugc_journals.length} Non-UGC papers`);
        }

        // Migrate Conference proceedings
        if (professor.conference_proceedings && professor.conference_proceedings.length > 0) {
            console.log('\n🎤 Processing Conference proceedings...');
            updateOps.conference_proceedings = professor.conference_proceedings.map(paper => ({
                ...paper,
                coauthors_within_org: paper.authors || '',
                coauthors_outside_org: '',
                conference_name: paper.conference_details || ''
            }));
            console.log(`  • Updated ${updateOps.conference_proceedings.length} Conference papers`);
        }

        // Perform the update
        if (Object.keys(updateOps).length > 0) {
            console.log('\n💾 Applying field migrations...');

            const result = await collection.updateOne(
                { _id: professor._id },
                { $set: updateOps }
            );

            if (result.modifiedCount > 0) {
                console.log('✅ Migration completed successfully!');

                // Verify the update
                const updatedProfessor = await collection.findOne({ _id: professor._id });

                console.log('\n🔍 Verification:');

                if (updatedProfessor.ugc_approved_journals?.length > 0) {
                    const sample = updatedProfessor.ugc_approved_journals[0];
                    console.log('  UGC Paper Fields:');
                    console.log(`    • title: "${sample.title?.substring(0, 30)}..."`);
                    console.log(`    • authors: "${sample.authors?.substring(0, 30)}..."`);
                    console.log(`    • coauthors_within_org: "${sample.coauthors_within_org?.substring(0, 30)}..."`);
                    console.log(`    • coauthors_outside_org: "${sample.coauthors_outside_org}"`);
                }

                if (updatedProfessor.conference_proceedings?.length > 0) {
                    const sample = updatedProfessor.conference_proceedings[0];
                    console.log('  Conference Paper Fields:');
                    console.log(`    • title: "${sample.title?.substring(0, 30)}..."`);
                    console.log(`    • authors: "${sample.authors?.substring(0, 30)}..."`);
                    console.log(`    • coauthors_within_org: "${sample.coauthors_within_org?.substring(0, 30)}..."`);
                    console.log(`    • conference_details: "${sample.conference_details?.substring(0, 30)}..."`);
                    console.log(`    • conference_name: "${sample.conference_name?.substring(0, 30)}..."`);
                }

                console.log('\n🎉 Publications data now has frontend-compatible field names!');
                console.log('🌐 Frontend should now display data correctly in both tables.');

            } else {
                console.log('⚠️  No documents were modified');
            }
        } else {
            console.log('⚠️  No updates needed - data might already be migrated');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');

    } catch (error) {
        console.error('❌ Error during migration:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

directFieldMigration();