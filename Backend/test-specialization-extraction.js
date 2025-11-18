const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');

async function testSpecializationExtraction() {
  console.log('🧪 Testing specialization extraction for Node ID 941...\n');

  try {
    // 1. Test the scraper
    console.log('1️⃣ Testing FacultyDataScraper...');
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData('941');

    console.log(`✅ Scraper completed`);
    console.log(`📧 Name: ${scrapedData.name}`);
    console.log(`🏢 Department: ${scrapedData.department}`);

    // Check specialization in home section
    if (scrapedData.home && scrapedData.home.specialization) {
      console.log(`🎯 Raw Specialization Data:`, scrapedData.home.specialization);
      console.log(`📊 Type: ${typeof scrapedData.home.specialization}`);
      console.log(`📈 Length: ${Array.isArray(scrapedData.home.specialization) ? scrapedData.home.specialization.length : 'Not array'}`);
    } else {
      console.log('❌ No specialization found in home section');
    }

    // 2. Test the data transformer
    console.log('\n2️⃣ Testing DataTransformer...');
    const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);

    console.log(`✅ Transformer completed`);

    if (transformedData.area_of_expertise) {
      console.log(`🎯 Transformed Area of Expertise:`, transformedData.area_of_expertise);
      console.log(`📊 Type: ${typeof transformedData.area_of_expertise}`);
      console.log(`📈 Length: ${Array.isArray(transformedData.area_of_expertise) ? transformedData.area_of_expertise.length : 'Not array'}`);
    } else {
      console.log('❌ No area_of_expertise found after transformation');
    }

    // 3. Check the transformation function specifically
    console.log('\n3️⃣ Testing flattenSpecialization function directly...');
    if (scrapedData.home && scrapedData.home.specialization) {
      const flattened = DataTransformer.flattenSpecialization(scrapedData.home.specialization);
      console.log(`🔄 Flattened result:`, flattened);
      console.log(`📊 Type: ${typeof flattened}`);
      console.log(`📈 Length: ${Array.isArray(flattened) ? flattened.length : 'Not array'}`);
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testSpecializationExtraction();