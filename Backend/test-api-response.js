const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

const testApiResponse = async () => {
  try {
    console.log('🔄 Testing API Response Format');
    console.log('=====================================');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to database');

    // Find a professor with data
    const professor = await Professor.findOne({
      papers_published: { $exists: true, $not: { $size: 0 } }
    }).select('-password');

    if (!professor) {
      console.log('❌ No professor found with papers_published data');
      return;
    }

    console.log(`\n👨‍🏫 Testing API response for: ${professor.name}`);
    console.log(`📄 Papers published count: ${professor.papers_published?.length || 0}`);

    // Simulate the API response format
    const sanitizePublications = (publications) => {
      return publications.map(pub => ({
        ...pub.toObject(),
        paper_upload: "", // Sanitized for non-own profile
        paper_upload_filename: "",
        paper_link: ""
      }));
    };

    const publicationsData = {
      name: professor.name,
      email: professor.email,
      papers_published: sanitizePublications(professor.papers_published || []),
      ugcPapers: sanitizePublications([
        ...(professor.ugc_papers || []),
        ...(professor.ugc_approved_journals || [])
      ]),
      nonUgcPapers: sanitizePublications([
        ...(professor.non_ugc_papers || []),
        ...(professor.non_ugc_journals || [])
      ]),
      seie_journals: sanitizePublications(professor.seie_journals || []),
      ugc_approved_journals: sanitizePublications(professor.ugc_approved_journals || []),
      non_ugc_journals: sanitizePublications(professor.non_ugc_journals || []),
      conference_proceedings: sanitizePublications(professor.conference_proceedings || [])
    };

    console.log('\n📊 API Response Summary:');
    console.log(`  papers_published: ${publicationsData.papers_published.length} papers`);
    console.log(`  ugcPapers: ${publicationsData.ugcPapers.length} papers`);
    console.log(`  nonUgcPapers: ${publicationsData.nonUgcPapers.length} papers`);

    if (publicationsData.papers_published.length > 0) {
      console.log('\n🔍 First paper_published sample:');
      const sample = publicationsData.papers_published[0];
      console.log(`  Title: ${sample.title}`);
      console.log(`  Paper Type: ${sample.paper_type}`);
      console.log(`  Journal: ${sample.journal_name}`);
      console.log(`  Co-authors (within): "${sample.coauthors_within_org}"`);
      console.log(`  Co-authors (outside): "${sample.coauthors_outside_org}"`);
      console.log(`  Paper Link: "${sample.paper_link}"`);
      console.log(`  Year: ${sample.year}`);
    }

    // Check for different paper types
    const ugcCount = publicationsData.papers_published.filter(p => p.paper_type === 'UGC').length;
    const scopusCount = publicationsData.papers_published.filter(p => p.paper_type === 'Scopus').length;
    const scieCount = publicationsData.papers_published.filter(p => p.paper_type === 'SCIE').length;

    console.log('\n📈 Paper Type Distribution in papers_published:');
    console.log(`  UGC papers: ${ugcCount}`);
    console.log(`  Scopus papers: ${scopusCount}`);
    console.log(`  SCIE papers: ${scieCount}`);

    if (ugcCount === 0 && scopusCount === 0 && scieCount === 0) {
      console.log('\n⚠️  WARNING: No papers found with recognized types!');
      console.log('   This might explain why the frontend table appears empty.');

      if (publicationsData.papers_published.length > 0) {
        const uniqueTypes = [...new Set(publicationsData.papers_published.map(p => p.paper_type))];
        console.log(`   Found paper types: ${uniqueTypes.join(', ')}`);
      }
    } else {
      console.log('\n✅ SUCCESS: Papers found with correct types for frontend display!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testApiResponse();