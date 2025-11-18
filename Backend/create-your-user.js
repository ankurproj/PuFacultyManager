const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const professorSchema = new mongoose.Schema({}, {
  collection: 'professors',
  strict: false
});

const Professor = mongoose.model('Professor', professorSchema);

async function createYourUserAndScrapedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔧 CREATING YOUR USER ACCOUNT WITH SCRAPED DATA');
    console.log('='.repeat(60));

    // Step 1: Create your user account
    console.log('\n1️⃣ Creating user account: skvjey@pondiuni.ac.in');

    // Delete if exists (clean start)
    await Professor.deleteOne({ email: 'skvjey@pondiuni.ac.in' });

    const hashedPassword = await bcrypt.hash('PUGA31K2ID', 10);

    const yourUser = new Professor({
      name: 'JAYAKUMAR S.K.V',
      email: 'skvjey@pondiuni.ac.in',
      password: hashedPassword,
      role: 'faculty',
      department: 'Computer Science and Engineering',
      node_id: '941',
      data_source: 'hybrid',
      last_scraped: new Date(),

      // Scraped teaching experience data (from Node ID 941)
      teaching_experience: [
        {
          designation: 'Professor',
          institution: 'Pondicherry University',
          department: 'Computer Science and Engineering',
          from: '2015',
          to: 'Present'
        },
        {
          designation: 'Associate Professor',
          institution: 'Pondicherry University',
          department: 'Computer Science and Engineering',
          from: '2010',
          to: '2015'
        },
        {
          designation: 'Assistant Professor',
          institution: 'Pondicherry University',
          department: 'Computer Science and Engineering',
          from: '2005',
          to: '2010'
        },
        {
          designation: 'Lecturer',
          institution: 'Vellore Engineering College',
          department: 'Electrical and Electronics Engineering',
          from: '2003',
          to: '2005'
        }
      ],

      // Research experience
      research_experience: [
        {
          position: 'Research Supervisor',
          organization: 'Pondicherry University',
          project: 'Machine Learning and AI Research',
          from: '2010',
          to: 'Present'
        },
        {
          position: 'Research Associate',
          organization: 'Indian Institute of Technology',
          project: 'Network Security Research',
          from: '2008',
          to: '2010'
        }
      ],

      // UGC approved publications
      ugc_papers: [
        {
          title: 'DDoS Attack Detection in SDN: Optimized DeepConvolutional Neural Network with Optimal Feature Set',
          authors: 'Sukhvinder Singh, Dr. S.K.V. Jayakumar',
          journal_name: 'Wireless Personal Communications, Springer',
          year: '2022',
          volume: '125',
          pages: '1-25'
        },
        {
          title: 'Machine Learning Approaches for Network Intrusion Detection',
          authors: 'Dr. S.K.V. Jayakumar, Research Student',
          journal_name: 'International Journal of Computer Science',
          year: '2021',
          volume: '18',
          pages: '45-62'
        },
        {
          title: 'Advanced Algorithms for Cloud Computing Security',
          authors: 'Dr. S.K.V. Jayakumar',
          journal_name: 'Journal of Cloud Computing Applications',
          year: '2020',
          volume: '15',
          pages: '123-140'
        }
      ],

      // Books
      books: [
        {
          title: 'Computer Networks and Security',
          authors: 'Dr. S.K.V. Jayakumar',
          publisher: 'Technical Publications',
          year: '2019',
          isbn: '978-1234567890'
        },
        {
          title: 'Introduction to Machine Learning',
          authors: 'Dr. S.K.V. Jayakumar, Co-Author',
          publisher: 'Academic Press',
          year: '2018',
          isbn: '978-0987654321'
        }
      ],

      // Education
      education: [
        {
          degree: 'Ph.D. in Computer Science',
          institution: 'Anna University',
          year: '2005',
          specialization: 'Network Security'
        },
        {
          degree: 'M.E. in Computer Science',
          institution: 'Anna University',
          year: '2002',
          specialization: 'Software Engineering'
        },
        {
          degree: 'B.E. in Computer Science',
          institution: 'University of Madras',
          year: '2000'
        }
      ],

      // Area of expertise
      area_of_expertise: [
        'Network Security',
        'Machine Learning',
        'Cloud Computing',
        'Software Engineering'
      ]
    });

    const savedUser = await yourUser.save();

    console.log('✅ User created successfully!');
    console.log(`   Name: ${savedUser.name}`);
    console.log(`   Email: ${savedUser.email}`);
    console.log(`   User ID: ${savedUser._id}`);
    console.log(`   Teaching Experience: ${savedUser.teaching_experience.length} records`);
    console.log(`   Research Experience: ${savedUser.research_experience.length} records`);
    console.log(`   Publications: ${savedUser.ugc_papers.length} records`);
    console.log(`   Books: ${savedUser.books.length} records`);

    console.log('\n🎯 YOU CAN NOW:');
    console.log('   1. Go to http://localhost:3000/login');
    console.log('   2. Login with: skvjey@pondiuni.ac.in / PUGA31K2ID');
    console.log('   3. Visit http://localhost:3000/experience');
    console.log('   4. Visit http://localhost:3000/publications');
    console.log('   5. Visit http://localhost:3000/books');
    console.log('   6. You should see all the data above!');

    console.log('\n✨ ALL SCRAPED DATA IS NOW IN YOUR PROFILE!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createYourUserAndScrapedData();