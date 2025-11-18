// Migrate existing publications data to match frontend field expectations
const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

async function migratePublicationsFields() {
    try {
        console.log('🔄 Migrating publications fields to match frontend expectations...');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📊 Connected to database');

        // Find the professor
        const professor = await Professor.findOne({
            name: /JAYAKUMAR/i
        });

        if (!professor) {
            console.log('❌ Professor not found');
            return;
        }

        console.log(`\n👨‍🏫 Found professor: ${professor.name}`);

        let hasUpdates = false;

        // Migrate UGC papers - add frontend-expected fields
        if (professor.ugc_approved_journals && professor.ugc_approved_journals.length > 0) {
            console.log('\n🔬 Migrating UGC papers...');
            professor.ugc_approved_journals = professor.ugc_approved_journals.map(paper => {
                // If already migrated, skip
                if (paper.coauthors_within_org !== undefined || paper.coauthors_outside_org !== undefined) {
                    return paper;
                }

                console.log(`  • Migrating: "${paper.title?.substring(0, 50)}..."`);

                // Split authors into within/outside org (for now, put all in within_org)
                const authors = paper.authors || '';

                return {
                    ...paper.toObject(),
                    coauthors_within_org: authors,
                    coauthors_outside_org: '',
                    // Keep the old authors field for backward compatibility
                    authors: authors
                };
            });
            hasUpdates = true;
        }

        // Migrate Non-UGC papers
        if (professor.non_ugc_journals && professor.non_ugc_journals.length > 0) {
            console.log('\n📖 Migrating Non-UGC papers...');
            professor.non_ugc_journals = professor.non_ugc_journals.map(paper => {
                // If already migrated, skip
                if (paper.coauthors_within_org !== undefined || paper.coauthors_outside_org !== undefined) {
                    return paper;
                }

                console.log(`  • Migrating: "${paper.title?.substring(0, 50)}..."`);

                const authors = paper.authors || '';

                return {
                    ...paper.toObject(),
                    coauthors_within_org: authors,
                    coauthors_outside_org: '',
                    authors: authors
                };
            });
            hasUpdates = true;
        }

        // Migrate Conference proceedings
        if (professor.conference_proceedings && professor.conference_proceedings.length > 0) {
            console.log('\n🎤 Migrating Conference proceedings...');
            professor.conference_proceedings = professor.conference_proceedings.map(paper => {
                // If already migrated, skip
                if (paper.coauthors_within_org !== undefined || paper.coauthors_outside_org !== undefined || paper.conference_name !== undefined) {
                    return paper;
                }

                console.log(`  • Migrating: "${paper.title?.substring(0, 50)}..."`);

                const authors = paper.authors || '';

                return {
                    ...paper.toObject(),
                    coauthors_within_org: authors,
                    coauthors_outside_org: '',
                    conference_name: paper.conference_details || '', // Map conference_details to conference_name
                    // Keep original fields for backward compatibility
                    authors: authors,
                    conference_details: paper.conference_details || ''
                };
            });
            hasUpdates = true;
        }

        // Save updates if any
        if (hasUpdates) {
            console.log('\n💾 Saving migrated data...');

            await professor.save();

            console.log('✅ Publications data migration completed successfully!');

            // Verify the migration
            console.log('\n🔍 Verification:');

            if (professor.ugc_approved_journals?.length > 0) {
                const sample = professor.ugc_approved_journals[0];
                console.log('  UGC Paper sample fields:');
                console.log(`    • title: "${sample.title?.substring(0, 30)}..."`);
                console.log(`    • coauthors_within_org: "${sample.coauthors_within_org?.substring(0, 30)}..."`);
                console.log(`    • coauthors_outside_org: "${sample.coauthors_outside_org}"`);
            }

            if (professor.conference_proceedings?.length > 0) {
                const sample = professor.conference_proceedings[0];
                console.log('  Conference Paper sample fields:');
                console.log(`    • title: "${sample.title?.substring(0, 30)}..."`);
                console.log(`    • coauthors_within_org: "${sample.coauthors_within_org?.substring(0, 30)}..."`);
                console.log(`    • conference_name: "${sample.conference_name?.substring(0, 30)}..."`);
            }

            console.log('\n🌐 Frontend publications page should now display data correctly!');

        } else {
            console.log('\n✅ Data already migrated - no updates needed');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');

    } catch (error) {
        console.error('❌ Error during migration:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

migratePublicationsFields();