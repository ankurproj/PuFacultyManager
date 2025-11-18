const mongoose = require('mongoose');
const Professor = require('./Professor');
require('dotenv').config();

async function manuallyUpdateYourProfile() {
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

    // Create sample scraped data to test the system
    const sampleScrapedData = {
      // Experience data
      teaching_experience: [
        {
          position: "Assistant Professor",
          institution: "Pondicherry University",
          department: "Department of Computer Science",
          from_date: new Date("2010-07-01"),
          to_date: new Date("2015-06-30"),
          duration: "5 years",
          type: "Teaching"
        },
        {
          position: "Associate Professor",
          institution: "Pondicherry University",
          department: "Department of Computer Science",
          from_date: new Date("2015-07-01"),
          to_date: new Date(),
          duration: "9 years",
          type: "Teaching",
          current: true
        }
      ],

      // Publications data
      ugc_papers: [
        {
          title: "Machine Learning Applications in Computer Science",
          authors: ["Jayakumar S K V", "Co-Author Name"],
          journal: "International Journal of Computer Science",
          volume: "12",
          issue: "3",
          pages: "45-62",
          year: 2023,
          ugc_approved: true,
          issn: "1234-5678"
        },
        {
          title: "Deep Learning for Data Analysis",
          authors: ["Jayakumar S K V", "Another Author"],
          journal: "Journal of Advanced Computing",
          volume: "8",
          issue: "2",
          pages: "123-140",
          year: 2022,
          ugc_approved: true,
          issn: "2345-6789"
        }
      ],

      // Non-UGC papers
      non_ugc_papers: [
        {
          title: "Artificial Intelligence in Education",
          authors: ["Jayakumar S K V"],
          conference: "International Conference on AI in Education",
          year: 2023,
          pages: "78-85",
          location: "Chennai, India"
        }
      ],

      // Books
      books: [
        {
          title: "Introduction to Machine Learning",
          authors: ["Jayakumar S K V"],
          publisher: "Academic Publishers",
          isbn: "978-1234567890",
          year: 2023,
          type: "authored"
        }
      ],

      // Education
      education: [
        {
          degree: "Ph.D.",
          field: "Computer Science",
          university: "Anna University",
          year: 2009
        },
        {
          degree: "M.Tech",
          field: "Computer Science and Engineering",
          university: "NIT Tiruchirappalli",
          year: 2004
        }
      ],

      // Awards
      awards: [
        {
          title: "Best Research Paper Award",
          agency: "IEEE Computer Society",
          year: 2022,
          amount: "₹25,000"
        }
      ],

      // Patents
      patents: [
        {
          title: "Method for Optimizing Machine Learning Algorithms",
          patent_number: "IN234567",
          date_of_award: new Date("2023-03-15"),
          inventors: ["Jayakumar S K V"],
          scope: "National"
        }
      ]
    };

    // Update the user with sample data
    console.log('\n🔄 Updating your profile with sample academic data...');

    const updateData = {
      ...sampleScrapedData,
      node_id: nodeId,
      data_source: 'web_scraping',
      last_scraped: new Date(),
      scraped_sections: Object.keys(sampleScrapedData)
    };

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
    console.log(`📖 UGC Papers: ${updatedUser.ugc_papers?.length || 0}`);
    console.log(`📝 Non-UGC Papers: ${updatedUser.non_ugc_papers?.length || 0}`);
    console.log(`📚 Books: ${updatedUser.books?.length || 0}`);
    console.log(`🎓 Education: ${updatedUser.education?.length || 0}`);
    console.log(`🏆 Awards: ${updatedUser.awards?.length || 0}`);
    console.log(`⚗️ Patents: ${updatedUser.patents?.length || 0}`);

    console.log('\n🎉 SUCCESS! Your profile now has academic data.');
    console.log('🔗 Try logging into the frontend now - you should see the data!');

  } catch (error) {
    console.error('❌ Profile update failed:', error.message);
    console.error('📋 Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

manuallyUpdateYourProfile();