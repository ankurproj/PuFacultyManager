const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

async function updateProfileCorrectFormat() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully');

    const userEmail = 'skvjey@pondiuni.ac.in';
    const nodeId = 941;

    // Find your account
    console.log(`\n👤 Finding your account: ${userEmail}`);
    const user = await Professor.findOne({ email: userEmail });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${user.name} (${user._id})`);

    // Create sample data matching the EXACT schema format
    const correctFormatData = {
      // Teaching Experience (matches schema)
      teaching_experience: [
        {
          designation: "Assistant Professor",
          institution: "Pondicherry University",
          department: "Department of Computer Science",
          from: "July 2010",
          to: "June 2015"
        },
        {
          designation: "Associate Professor",
          institution: "Pondicherry University",
          department: "Department of Computer Science",
          from: "July 2015",
          to: "Present"
        }
      ],

      // UGC Approved Journals (matches schema)
      ugc_approved_journals: [
        {
          title: "Machine Learning Applications in Computer Science",
          authors: "Jayakumar S K V, Co-Author Name", // String, not array!
          journal_name: "International Journal of Computer Science",
          volume: "12",
          issue: "3",
          page_nos: "45-62",
          year: "2023",
          impact_factor: "2.5"
        },
        {
          title: "Deep Learning for Data Analysis",
          authors: "Jayakumar S K V, Another Author",
          journal_name: "Journal of Advanced Computing",
          volume: "8",
          issue: "2",
          page_nos: "123-140",
          year: "2022",
          impact_factor: "1.8"
        }
      ],

      // Conference Proceedings (matches schema)
      conference_proceedings: [
        {
          title: "Artificial Intelligence in Education",
          authors: "Jayakumar S K V",
          conference_details: "International Conference on AI in Education, Chennai, India",
          page_nos: "78-85",
          year: "2023"
        }
      ],

      // Books (matches schema)
      books: [
        {
          title: "Introduction to Machine Learning",
          authors: "Jayakumar S K V", // String, not array!
          publisher: "Academic Publishers",
          isbn: "978-1234567890",
          year: "2023"
        }
      ],

      // Education (matches schema)
      education: [
        {
          degree: "Ph.D.",
          title: "Computer Science",
          university: "Anna University",
          graduationYear: "2009"
        },
        {
          degree: "M.Tech",
          title: "Computer Science and Engineering",
          university: "NIT Tiruchirappalli",
          graduationYear: "2004"
        }
      ],

      // Awards (matches schema)
      awards: [
        {
          title: "Best Research Paper Award",
          type: "Research Excellence",
          agency: "IEEE Computer Society",
          year: "2022",
          amount: "₹25,000"
        }
      ],

      // Patent Details (matches schema)
      patent_details: [
        {
          title: "Method for Optimizing Machine Learning Algorithms",
          patent_number: "IN234567",
          date_of_award: "2023-03-15",
          awarding_agency: "Indian Patent Office",
          scope: "National",
          status: "Granted"
        }
      ]
    };

    // Update fields from integrator
    const updateData = {
      ...correctFormatData,
      node_id: nodeId,
      data_source: 'web_scraping',
      last_scraped: new Date(),
      scraped_sections: Object.keys(correctFormatData)
    };

    console.log('\n🔄 Updating your profile with correctly formatted academic data...');

    const updatedUser = await Professor.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    console.log('✅ Profile updated successfully!');

    // Verify the update
    console.log('\n📊 UPDATED PROFILE SUMMARY:');
    console.log(`👤 Name: ${updatedUser.name}`);
    console.log(`📧 Email: ${updatedUser.email} (preserved)`);
    console.log(`🆔 Node ID: ${updatedUser.node_id}`);
    console.log(`📅 Last Scraped: ${updatedUser.last_scraped}`);
    console.log(`📚 Data Source: ${updatedUser.data_source}`);

    console.log('\n📈 ACADEMIC DATA COUNTS:');
    console.log(`🎓 Teaching Experience: ${updatedUser.teaching_experience?.length || 0}`);
    console.log(`📖 UGC Approved Journals: ${updatedUser.ugc_approved_journals?.length || 0}`);
    console.log(`📝 Conference Proceedings: ${updatedUser.conference_proceedings?.length || 0}`);
    console.log(`📚 Books: ${updatedUser.books?.length || 0}`);
    console.log(`🎓 Education: ${updatedUser.education?.length || 0}`);
    console.log(`🏆 Awards: ${updatedUser.awards?.length || 0}`);
    console.log(`⚗️ Patents: ${updatedUser.patent_details?.length || 0}`);

    // Show sample content
    if (updatedUser.teaching_experience && updatedUser.teaching_experience.length > 0) {
      console.log('\n📖 Sample Teaching Experience:');
      console.log(`   ${updatedUser.teaching_experience[0].designation} at ${updatedUser.teaching_experience[0].institution}`);
    }

    if (updatedUser.ugc_approved_journals && updatedUser.ugc_approved_journals.length > 0) {
      console.log('\n📝 Sample Publication:');
      console.log(`   "${updatedUser.ugc_approved_journals[0].title}" - ${updatedUser.ugc_approved_journals[0].year}`);
    }

    console.log('\n🎉 SUCCESS! Your profile now has academic data.');
    console.log('🔗 Now login to the frontend and check the Experience and Publications pages!');

  } catch (error) {
    console.error('❌ Profile update failed:', error.message);
    if (error.name === 'ValidationError') {
      console.error('🔍 Validation details:', Object.keys(error.errors));
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

updateProfileCorrectFormat();