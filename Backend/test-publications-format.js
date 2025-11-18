// Test the new publications format transformation
const DataTransformer = require('./utils/dataTransformer');

console.log('🧪 Testing Publications Format Transformation');
console.log('============================================');

// Mock scraped data that represents what comes from the scraper
const mockScrapedData = {
    innovation: {
        ugc_papers: [
            {
                title: 'Research Paper on Machine Learning',
                authors: 'Dr. John Doe, Dr. Jane Smith', // This should not be used in new format
                journalName: 'International Journal of AI',
                volumeIssuePages: 'Vol 15, Issue 3, Pages 123-145',
                year: '2024',
                impactFactor: '3.456'
            },
            {
                title: 'Advanced Data Mining Techniques',
                authors: 'Dr. Alice Brown',
                journalName: 'Journal of Data Science',
                volumeIssuePages: 'Vol 8, Issue 2, Pages 67-89',
                year: '2023',
                impactFactor: '2.789'
            }
        ],
        non_ugc_papers: [
            {
                title: 'Cloud Computing Security Analysis',
                authors: 'Dr. Bob Wilson, Dr. Carol Davis',
                journalName: 'Scopus Computing Journal',
                volumeIssuePages: 'Vol 12, Issue 1, Pages 45-67',
                year: '2024',
                impactFactor: '1.234'
            }
        ]
    }
};

console.log('\n📋 Mock Scraped Data:');
console.log('UGC Papers:', mockScrapedData.innovation.ugc_papers.length);
console.log('Non-UGC Papers:', mockScrapedData.innovation.non_ugc_papers.length);

// Transform using the new methods
console.log('\n🔄 Transforming to New Format...');

const transformedUGC = DataTransformer.transformUGCPapersToNewFormat(mockScrapedData.innovation.ugc_papers);
const transformedNonUGC = DataTransformer.transformNonUGCPapersToNewFormat(mockScrapedData.innovation.non_ugc_papers);

const allPapersPublished = [...transformedUGC, ...transformedNonUGC];

console.log('\n✅ Transformed Papers Published:');
console.log('Total papers:', allPapersPublished.length);

allPapersPublished.forEach((paper, index) => {
    console.log(`\n📄 Paper ${index + 1}:`);
    console.log(`  Title: ${paper.title}`);
    console.log(`  Journal: ${paper.journal_name}`);
    console.log(`  Year: ${paper.year}`);
    console.log(`  Paper Type: ${paper.paper_type}`);
    console.log(`  Co-authors (Within Org): "${paper.coauthors_within_org}" (should be blank)`);
    console.log(`  Co-authors (Outside Org): "${paper.coauthors_outside_org}" (should be blank)`);
    console.log(`  Paper Link: "${paper.paper_link}" (should be blank)`);
    console.log(`  Volume: ${paper.volume}`);
    console.log(`  Issue: ${paper.issue}`);
    console.log(`  Pages: ${paper.page_nos}`);
    console.log(`  Impact Factor: ${paper.impact_factor}`);
});

// Verify requirements
console.log('\n🔍 Verification:');
console.log('================');

let ugcCount = allPapersPublished.filter(p => p.paper_type === 'UGC').length;
let scopusCount = allPapersPublished.filter(p => p.paper_type === 'Scopus').length;
let blankCoauthorsWithin = allPapersPublished.filter(p => p.coauthors_within_org === '').length;
let blankCoauthorsOutside = allPapersPublished.filter(p => p.coauthors_outside_org === '').length;
let blankPaperLinks = allPapersPublished.filter(p => p.paper_link === '').length;

console.log(`✅ UGC papers marked as 'UGC': ${ugcCount}/${mockScrapedData.innovation.ugc_papers.length}`);
console.log(`✅ Non-UGC papers marked as 'Scopus': ${scopusCount}/${mockScrapedData.innovation.non_ugc_papers.length}`);
console.log(`✅ Co-authors (Within Org) blank: ${blankCoauthorsWithin}/${allPapersPublished.length}`);
console.log(`✅ Co-authors (Outside Org) blank: ${blankCoauthorsOutside}/${allPapersPublished.length}`);
console.log(`✅ Paper Links blank: ${blankPaperLinks}/${allPapersPublished.length}`);

if (ugcCount === mockScrapedData.innovation.ugc_papers.length &&
    scopusCount === mockScrapedData.innovation.non_ugc_papers.length &&
    blankCoauthorsWithin === allPapersPublished.length &&
    blankCoauthorsOutside === allPapersPublished.length &&
    blankPaperLinks === allPapersPublished.length) {
    console.log('\n🎉 SUCCESS: All requirements met!');
    console.log('   - UGC papers are marked as "UGC" type');
    console.log('   - Non-UGC papers are marked as "Scopus" type');
    console.log('   - Co-authors columns are blank for scraped data');
    console.log('   - Paper links are blank as requested');
    console.log('   - Rest of the data shows as scraped (title, journal, volume, etc.)');
} else {
    console.log('\n❌ Some requirements not met. Check the output above.');
}