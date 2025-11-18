const mongoose = require('mongoose');
require('dotenv').config();

async function exploreDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    console.log(`📡 Full URI: ${process.env.MONGO_URI}`);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');

    // Get database name from URI
    const dbName = process.env.MONGO_URI.split('/')[3].split('?')[0];
    console.log(`📂 Current database: ${dbName}`);

    // List all collections
    console.log('\n📋 ALL COLLECTIONS IN THIS DATABASE:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);

    for (const collection of collections) {
      console.log(`\n📁 Collection: ${collection.name}`);

      // Count documents in each collection
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`   📊 Documents: ${count}`);

      if (count > 0 && count < 20) {
        // Show sample documents for small collections
        const samples = await mongoose.connection.db.collection(collection.name).find({}).limit(3).toArray();
        console.log(`   📝 Sample documents:`);
        samples.forEach((doc, index) => {
          console.log(`      ${index + 1}. ID: ${doc._id}`);
          if (doc.name) console.log(`         Name: ${doc.name}`);
          if (doc.email) console.log(`         Email: ${doc.email}`);
          if (doc.title) console.log(`         Title: ${doc.title}`);
        });
      }
    }

    // Specifically check 'professors' collection with different queries
    console.log('\n🔍 DETAILED PROFESSORS COLLECTION ANALYSIS:');

    const professorSchema = new mongoose.Schema({}, { strict: false });
    const Professor = mongoose.model('Professor', professorSchema, 'professors');

    const totalProfs = await Professor.countDocuments();
    console.log(`📊 Total professors: ${totalProfs}`);

    // Try different queries
    const queries = [
      { query: {}, name: 'All documents' },
      { query: { email: { $exists: true } }, name: 'With email field' },
      { query: { name: { $exists: true } }, name: 'With name field' },
      { query: { email: { $regex: 'pondiuni', $options: 'i' } }, name: 'Pondicherry emails' },
      { query: { email: { $regex: 'skvjey', $options: 'i' } }, name: 'SKVJEY emails' },
      { query: { name: { $regex: 'jayakumar', $options: 'i' } }, name: 'Jayakumar names' }
    ];

    for (const { query, name } of queries) {
      const count = await Professor.countDocuments(query);
      console.log(`   ${name}: ${count} documents`);

      if (count > 0 && count <= 10) {
        const results = await Professor.find(query).limit(5);
        results.forEach((doc, index) => {
          console.log(`      ${index + 1}. ${doc.name || 'No name'} - ${doc.email || 'No email'}`);
        });
      }
    }

    // Check if there are any other professor-like collections
    const profCollections = collections.filter(c =>
      c.name.toLowerCase().includes('prof') ||
      c.name.toLowerCase().includes('user') ||
      c.name.toLowerCase().includes('faculty') ||
      c.name.toLowerCase().includes('teacher')
    );

    if (profCollections.length > 1) {
      console.log('\n🎓 OTHER PROFESSOR-RELATED COLLECTIONS:');
      for (const coll of profCollections) {
        if (coll.name !== 'professors') {
          const count = await mongoose.connection.db.collection(coll.name).countDocuments();
          console.log(`   ${coll.name}: ${count} documents`);

          if (count > 0 && count <= 10) {
            const samples = await mongoose.connection.db.collection(coll.name).find({}).limit(3).toArray();
            samples.forEach((doc, index) => {
              console.log(`      ${index + 1}. ${JSON.stringify(doc).substring(0, 100)}...`);
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Database exploration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

exploreDatabase();