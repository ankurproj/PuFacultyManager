/**
 * Test the actual scraping and transformation process for node 941
 */

const mongoose = require('mongoose');
const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');

async function testScrapingAndTransformation() {
  try {
    console.log('🔍 Testing scraping and transformation for node 941...\n');

    // Step 1: Scrape the data
    console.log('📡 Step 1: Scraping faculty data...');
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData('941');

    if (!scrapedData) {
      console.log('❌ No scraped data returned');
      return;
    }

    console.log('✅ Scraped data received');
    console.log(`   Name: ${scrapedData.name}`);
    console.log(`   Email: ${scrapedData.email}`);
    console.log(`   Department: ${scrapedData.department}`);

    // Check projects in scraped data
    console.log('\n📋 Projects in scraped data:');
    if (scrapedData.projects) {
      console.log(`   Ongoing projects: ${scrapedData.projects.ongoing_projects?.length || 0}`);
      console.log(`   Completed projects: ${scrapedData.projects.completed_projects?.length || 0}`);
      console.log(`   Ongoing consultancy: ${scrapedData.projects.ongoing_consultancy?.length || 0}`);
      console.log(`   Completed consultancy: ${scrapedData.projects.completed_consultancy?.length || 0}`);

      // Show sample project data
      if (scrapedData.projects.ongoing_projects?.length > 0) {
        console.log('\n🔍 First ongoing project (scraped):');
        const project = scrapedData.projects.ongoing_projects[0];
        console.log(`   Title: "${project.title}"`);
        console.log(`   Sponsored by: "${project.sponsoredBy}"`);
        console.log(`   Period: "${project.period}"`);
        console.log(`   Amount: "${project.sanctionedAmount}"`);
        console.log(`   Year: "${project.year}"`);
      }

      if (scrapedData.projects.completed_consultancy?.length > 0) {
        console.log('\n🔍 First completed consultancy (scraped):');
        const consultancy = scrapedData.projects.completed_consultancy[0];
        console.log(`   Title: "${consultancy.title}"`);
        console.log(`   Sponsored by: "${consultancy.sponsoredBy}"`);
        console.log(`   Period: "${consultancy.period}"`);
        console.log(`   Amount: "${consultancy.sanctionedAmount}"`);
        console.log(`   Year: "${consultancy.year}"`);
      }
    } else {
      console.log('   No projects section found in scraped data');
    }

    // Step 2: Transform the data
    console.log('\n🔄 Step 2: Transforming scraped data...');
    const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);

    console.log('✅ Data transformed');
    console.log(`   Ongoing projects: ${transformedData.ongoing_projects?.length || 0}`);
    console.log(`   Completed projects: ${transformedData.completed_projects?.length || 0}`);
    console.log(`   Ongoing consultancy: ${transformedData.ongoing_consultancy_works?.length || 0}`);
    console.log(`   Completed consultancy: ${transformedData.completed_consultancy_works?.length || 0}`);

    // Show sample transformed project data
    if (transformedData.ongoing_projects?.length > 0) {
      console.log('\n🔍 First ongoing project (transformed):');
      const project = transformedData.ongoing_projects[0];
      console.log(`   Title: "${project.title_of_project}"`);
      console.log(`   Sponsored by: "${project.sponsored_by}"`);
      console.log(`   Period: "${project.period}"`);
      console.log(`   Amount: "${project.sanctioned_amount}"`);
      console.log(`   Year: "${project.year}"`);
    }

    if (transformedData.completed_consultancy_works?.length > 0) {
      console.log('\n🔍 First completed consultancy (transformed):');
      const consultancy = transformedData.completed_consultancy_works[0];
      console.log(`   Title: "${consultancy.title_of_consultancy_work}"`);
      console.log(`   Sponsored by: "${consultancy.sponsored_by}"`);
      console.log(`   Period: "${consultancy.period}"`);
      console.log(`   Amount: "${consultancy.sanctioned_amount}"`);
      console.log(`   Year: "${consultancy.year}"`);
    }

  } catch (error) {
    console.error('❌ Error during scraping/transformation:', error);
  }
}

testScrapingAndTransformation();