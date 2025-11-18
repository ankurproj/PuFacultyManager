/**
 * Test FacultyDataIntegrator directly to debug issues
 */

require('dotenv').config();
const mongoose = require('mongoose');
const FacultyDataIntegrator = require('./utils/facultyDataIntegrator');

async function testFacultyDataIntegrator() {
  console.log('🔍 Testing FacultyDataIntegrator directly...\n');

  try {
    // Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Test scraping and storing
    console.log('\n2. Testing scrape and store for Node ID 941...');
    const result = await FacultyDataIntegrator.scrapeAndStore('941', {
      updateStrategy: 'merge',
      mergeOptions: {
        arrayMergeStrategy: 'smart_merge',
        conflictResolution: 'manual'
      }
    });

    console.log('✅ Scrape and store result:', result);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n📤 MongoDB disconnected');
    }
  }
}

testFacultyDataIntegrator();