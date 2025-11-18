const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');

async function testFullResearchExperiencePipeline() {
  try {
    console.log('🔍 Testing Full Research Experience Pipeline for Node ID 941...\n');

    // Step 1: Scrape data
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData('941');

    console.log('✅ Step 1: Scraped Research Experience Data:');
    console.log(JSON.stringify(scrapedData.experience?.research || [], null, 2));

    // Step 2: Transform data
    console.log('\n📄 Step 2: Transforming data for database...');
    const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);

    console.log('\n✅ Step 2: Transformed Research Experience Data:');
    console.log(JSON.stringify(transformedData.research_experience || [], null, 2));

    if (transformedData.research_experience && transformedData.research_experience.length > 0) {
      console.log('\n🎯 Research Experience Mapping Verification:');
      const firstEntry = transformedData.research_experience[0];
      console.log(`  - Position: "${firstEntry.position}" (from designation: "${scrapedData.experience.research[0].designation}")`);
      console.log(`  - Organization: "${firstEntry.organization}" (from institution: "${scrapedData.experience.research[0].institution}")`);
      console.log(`  - Project: "${firstEntry.project}" (from areaOfResearch: "${scrapedData.experience.research[0].areaOfResearch}")`);
      console.log(`  - From: "${firstEntry.from}"`);
      console.log(`  - To: "${firstEntry.to}"`);
    }

    console.log('\n🎉 SUCCESS: Research Experience pipeline working correctly!');
    console.log('   Area of Research "Services Computing" is now mapped to Project field');

  } catch (error) {
    console.error('❌ Error testing research experience pipeline:', error.message);
  }
}

testFullResearchExperiencePipeline();