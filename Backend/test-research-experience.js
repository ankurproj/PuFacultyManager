const FacultyDataScraper = require('./scrapers/facultyDataScraper');

async function testResearchExperienceScraped() {
  try {
    console.log('🔍 Testing Research Experience Scraping for Node ID 941...\n');

    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData('941');

    console.log('📊 Research Experience Data:');
    console.log(JSON.stringify(scrapedData.experience?.research || [], null, 2));

    if (scrapedData.experience?.research && scrapedData.experience.research.length > 0) {
      console.log('\n🔍 Research Experience Fields Available:');
      const firstEntry = scrapedData.experience.research[0];
      Object.keys(firstEntry).forEach(key => {
        console.log(`  - ${key}: ${firstEntry[key]}`);
      });
    } else {
      console.log('\n❌ No research experience data found');
    }

  } catch (error) {
    console.error('❌ Error testing research experience:', error.message);
  }
}

testResearchExperienceScraped();