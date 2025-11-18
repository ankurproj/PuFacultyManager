const mongoose = require('mongoose');
const Professor = require('./Professor');

async function checkAreaOfExpertiseInDB() {
  try {
    console.log('🔍 Checking Area of Expertise in MongoDB Atlas...\n');

    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Find the user with email skvjey@pondiuni.ac.in
    const user = await Professor.findOne({ email: 'skvjey@pondiuni.ac.in' });

    if (!user) {
      console.log('❌ User not found with email: skvjey@pondiuni.ac.in');
      return;
    }

    console.log('✅ User found!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name || user.full_name}`);
    console.log(`🆔 User ID: ${user._id}`);
    console.log(`📅 Last Updated: ${user.updatedAt}`);
    console.log(`🔧 Data Source: ${user.data_source || 'Not set'}`);
    console.log(`🌐 Node ID: ${user.node_id || 'Not set'}`);

    // Check area_of_expertise field specifically
    console.log('\n🎯 AREA OF EXPERTISE ANALYSIS:');
    console.log('Raw field value:', user.area_of_expertise);
    console.log('Type:', typeof user.area_of_expertise);
    console.log('Is Array:', Array.isArray(user.area_of_expertise));

    if (Array.isArray(user.area_of_expertise)) {
      console.log('Length:', user.area_of_expertise.length);
      console.log('Contents:');
      user.area_of_expertise.forEach((item, index) => {
        console.log(`  ${index + 1}. "${item}" (type: ${typeof item})`);
      });
    } else if (user.area_of_expertise) {
      console.log('Non-array content:', user.area_of_expertise);
    } else {
      console.log('❌ area_of_expertise is null, undefined, or empty');
    }

    // Check if there are any related fields
    console.log('\n🔍 RELATED FIELDS:');
    console.log('research_interests:', user.research_interests);
    console.log('subjects_taught:', user.subjects_taught);
    console.log('qualification:', user.qualification);

    // Show some sample data to verify the user has scraped data
    console.log('\n📊 VERIFICATION - Sample scraped data:');
    console.log(`📚 Teaching Experience: ${user.teaching_experience?.length || 0} records`);
    console.log(`📄 UGC Papers: ${user.ugc_approved_journals?.length || 0} records`);
    console.log(`📖 Books: ${user.books?.length || 0} records`);

    // Show the full user document structure (for debugging)
    console.log('\n🗂️ ALL FIELDS IN USER DOCUMENT:');
    const fields = Object.keys(user.toObject());
    fields.forEach(field => {
      const value = user[field];
      if (field === 'area_of_expertise') {
        console.log(`🎯 ${field}: ${JSON.stringify(value)} (FOCUS FIELD)`);
      } else if (Array.isArray(value)) {
        console.log(`   ${field}: Array(${value.length})`);
      } else if (typeof value === 'object' && value !== null) {
        console.log(`   ${field}: Object`);
      } else {
        console.log(`   ${field}: ${value}`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

checkAreaOfExpertiseInDB();