const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

const findProjectConsultancyFields = async () => {
  try {
    console.log('🔍 Searching for Project/Consultancy Related Fields');
    console.log('==================================================');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to database');

    // Get JAYAKUMAR S.K.V as our main test professor
    const professor = await Professor.findOne({ name: 'JAYAKUMAR S.K.V' });

    if (!professor) {
      console.log('❌ JAYAKUMAR S.K.V not found');
      return;
    }

    console.log(`\n👨‍🏫 Analyzing all fields for: ${professor.name}`);

    // Get all fields and look for anything that might contain project/consultancy data
    const professorObj = professor.toObject();

    // Look for fields containing keywords
    const projectKeywords = ['project', 'consultancy', 'funding', 'grant', 'research'];

    console.log('\n🔍 Fields that might contain project/consultancy data:');

    for (const [key, value] of Object.entries(professorObj)) {
      const keyLower = key.toLowerCase();
      const hasKeyword = projectKeywords.some(keyword => keyLower.includes(keyword));

      if (hasKeyword || key.includes('project') || key.includes('consultancy')) {
        console.log(`\n📋 Field: ${key}`);
        if (Array.isArray(value)) {
          console.log(`   Type: Array (${value.length} items)`);
          if (value.length > 0 && value[0]) {
            console.log(`   Sample:`, JSON.stringify(value[0], null, 2).substring(0, 200) + '...');
          }
        } else if (typeof value === 'object' && value !== null) {
          console.log(`   Type: Object`);
          console.log(`   Value:`, JSON.stringify(value, null, 2).substring(0, 200) + '...');
        } else {
          console.log(`   Type: ${typeof value}`);
          console.log(`   Value: "${value}"`);
        }
      }
    }

    // Also check if there are any fields we might have missed
    console.log('\n📋 All array fields (potential data sources):');
    for (const [key, value] of Object.entries(professorObj)) {
      if (Array.isArray(value) && value.length > 0) {
        console.log(`   ${key}: ${value.length} items`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

findProjectConsultancyFields();