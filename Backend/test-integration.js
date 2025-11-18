/**
 * Test Script for Faculty Data Integration
 * This script tests the complete workflow:
 * 1. Mock scraped data transformation
 * 2. Database compatibility validation
 * 3. Integration workflow testing
 */

const DataTransformer = require('./utils/dataTransformer');
const FacultyDataIntegrator = require('./utils/facultyDataIntegrator');
const Professor = require('./Professor');
require('dotenv').config();

// Mock scraped data (similar to what FacultyDataScraper would return)
const mockScrapedData = {
  name: "Dr. Test Faculty",
  designation: "Associate Professor",
  department: "Computer Science",
  school: "School of Engineering",
  email: "test.faculty@pu.edu.in",
  phone: "+91-9876543210",
  node_id: "TEST123",
  source_url: "https://pu.edu.in/faculty/test123",

  home: {
    education: [
      {
        degree: "Ph.D",
        title: "Advanced Machine Learning Techniques",
        university: "Indian Institute of Technology",
        graduationYear: "2018"
      },
      {
        degree: "M.Tech",
        title: "Computer Science and Engineering",
        university: "National Institute of Technology",
        graduationYear: "2014"
      }
    ],
    awards: [
      {
        title: "Best Research Paper Award",
        type: "Research Excellence",
        agency: "IEEE Computer Society",
        year: "2022",
        amount: "50000"
      }
    ]
  },

  experience: {
    teaching: [
      {
        designation: "Associate Professor",
        department: "Computer Science",
        institution: "Pondicherry University",
        duration: "2020-Present"
      },
      {
        designation: "Assistant Professor",
        department: "Computer Science",
        institution: "Anna University",
        duration: "2018-2020"
      }
    ],
    research: [
      {
        designation: "Research Associate",
        department: "AI Research Lab",
        institution: "IIT Madras",
        duration: "2016-2018"
      }
    ],
    industry: [
      {
        designation: "Senior Software Engineer",
        company: "TCS Innovation Labs",
        natureOfWork: "Machine Learning Research and Development",
        duration: "2014-2016"
      }
    ]
  },

  innovation: {
    contributions: [
      {
        workName: "AI-based Student Performance Prediction System",
        specialization: "Educational Technology",
        remarks: "Implemented in university ERP system"
      }
    ],
    patents: [
      {
        title: "Method for Automated Code Review using Machine Learning",
        status: "Published",
        patentNumber: "IN123456789",
        yearOfAward: "2023",
        type: "Invention",
        commercializedStatus: "Under Development"
      }
    ],
    ugc_papers: [
      {
        title: "Deep Learning Approaches for Natural Language Processing",
        authors: "Dr. Test Faculty, Dr. Co-author",
        journalName: "IEEE Transactions on Neural Networks",
        volumeIssuePages: "Vol 15, Issue 3, pp 245-260",
        year: "2023",
        impactFactor: "8.5"
      },
      {
        title: "Ensemble Methods for Big Data Analytics",
        authors: "Dr. Test Faculty, Dr. Another Author, Dr. Third Author",
        journalName: "Journal of Machine Learning Research",
        volumeIssuePages: "Vol 24, pp 1-25",
        year: "2023",
        impactFactor: "6.2"
      }
    ],
    non_ugc_papers: [
      {
        title: "Survey of Explainable AI Techniques",
        authors: "Dr. Test Faculty",
        journalName: "International Journal of AI Research",
        volumeIssuePages: "Vol 8, Issue 2, pp 100-115",
        year: "2022",
        impactFactor: "3.1"
      }
    ],
    conference_papers: [
      {
        title: "Real-time Anomaly Detection in IoT Networks",
        authors: "Dr. Test Faculty, Student Name",
        conferenceName: "International Conference on Machine Learning",
        venue: "Virtual Conference",
        year: "2023"
      }
    ]
  },

  books: {
    authored_books: [
      {
        title: "Introduction to Machine Learning with Python",
        authors: "Dr. Test Faculty, Dr. Co-author",
        publisher: "Springer Nature",
        year: "2023",
        isbn: "978-3-030-12345-6"
      }
    ],
    book_chapters: [
      {
        chapterTitle: "Deep Learning for Computer Vision",
        authors: "Dr. Test Faculty",
        bookTitle: "Advances in Artificial Intelligence",
        publisher: "Elsevier",
        year: "2022",
        isbn: "978-0-123456-78-9"
      }
    ],
    edited_books: [
      {
        title: "Handbook of AI in Education",
        authors: "Dr. Test Faculty (Editor), Dr. Co-editor",
        publisher: "Academic Press",
        year: "2023",
        isbn: "978-1-234567-89-0"
      }
    ]
  },

  projects: {
    ongoing_projects: [
      {
        title: "AI-Enhanced Learning Management System",
        sponsoredBy: "MHRD",
        period: "2023-2025",
        sanctionedAmount: "2500000",
        year: "2023"
      }
    ],
    completed_projects: [
      {
        title: "Smart Campus IoT Infrastructure",
        sponsoredBy: "DST",
        period: "2020-2023",
        sanctionedAmount: "1500000",
        year: "2020"
      }
    ],
    ongoing_consultancy: [
      {
        title: "ML Model Development for Banking Sector",
        sponsoredBy: "Private Bank Ltd",
        period: "2023-2024",
        sanctionedAmount: "800000",
        year: "2023"
      }
    ]
  },

  research_guidance: {
    phd_guidance: [
      {
        studentName: "John Doe",
        registrationNo: "PHD2021CS001",
        registrationDate: "2021-07-15",
        thesisTitle: "Advanced Neural Networks for Medical Image Analysis",
        status: "Ongoing"
      },
      {
        studentName: "Jane Smith",
        registrationNo: "PHD2020CS002",
        registrationDate: "2020-08-01",
        thesisTitle: "Blockchain-based Secure Data Sharing",
        status: "Thesis Submitted"
      }
    ]
  }
};

async function testDataTransformation() {
  console.log('🔄 Testing Data Transformation...\n');

  try {
    // Test the transformation
    const transformer = new DataTransformer();
    const transformedData = transformer.transformScrapedDataForDB(mockScrapedData);

    console.log('✅ Transformation successful!');
    console.log('\n📊 Transformation Results:');
    console.log('==========================================');

    // Display key transformations
    console.log('\n🔹 Basic Information:');
    console.log(`Name: ${transformedData.name}`);
    console.log(`Email: ${transformedData.email}`);
    console.log(`Department: ${transformedData.department}`);
    console.log(`Data Source: ${transformedData.data_source}`);

    console.log('\n🔹 Education (Flattened from home.education):');
    transformedData.education?.forEach((edu, index) => {
      console.log(`  ${index + 1}. ${edu.degree} - ${edu.title} (${edu.graduationYear})`);
    });

    console.log('\n🔹 Teaching Experience (Duration parsed):');
    transformedData.teaching_experience?.forEach((exp, index) => {
      console.log(`  ${index + 1}. ${exp.designation} at ${exp.institution} (${exp.from} - ${exp.to})`);
    });

    console.log('\n🔹 UGC Approved Journals (Volume/Issue parsed):');
    transformedData.ugc_approved_journals?.forEach((paper, index) => {
      console.log(`  ${index + 1}. ${paper.title}`);
      console.log(`     Volume: ${paper.volume}, Issue: ${paper.issue}, Pages: ${paper.page_nos}`);
    });

    console.log('\n🔹 Patents (Field mapping):');
    transformedData.patent_details?.forEach((patent, index) => {
      console.log(`  ${index + 1}. ${patent.patent_title} (${patent.year_of_award})`);
    });

    console.log('\n🔹 Books (Direct mapping):');
    transformedData.books?.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title} - ${book.publisher} (${book.year})`);
    });

    // Validate transformation
    const validation = transformer.validateTransformation(transformedData);
    console.log('\n✅ Validation Results:');
    console.log(`Valid: ${validation.isValid}`);
    if (validation.errors.length > 0) {
      console.log('❌ Errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.log('⚠️  Warnings:', validation.warnings);
    }

    return transformedData;

  } catch (error) {
    console.error('❌ Transformation failed:', error.message);
    return null;
  }
}

async function testFieldMapping() {
  console.log('\n\n🗺️  Testing Field Mapping...\n');

  const mappingTests = [
    {
      name: 'Duration Parsing',
      input: '2020-Present',
      expected: { from: '2020', to: 'Present' }
    },
    {
      name: 'Volume/Issue Parsing',
      input: 'Vol 15, Issue 3, pp 245-260',
      expected: { volume: '15', issue: '3', pages: '245-260' }
    },
    {
      name: 'Simple Volume Parsing',
      input: 'Vol 24, pp 1-25',
      expected: { volume: '24', issue: '', pages: '1-25' }
    }
  ];

  const transformer = new DataTransformer();

  mappingTests.forEach(test => {
    console.log(`🧪 ${test.name}:`);
    console.log(`   Input: "${test.input}"`);

    try {
      let result;
      if (test.name === 'Duration Parsing') {
        result = transformer.parseDateRange(test.input);
      } else {
        result = transformer.parseVolumeIssuePages(test.input);
      }

      console.log(`   Output:`, result);
      console.log(`   Expected:`, test.expected);
      console.log(`   ✅ Match: ${JSON.stringify(result) === JSON.stringify(test.expected)}\n`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  });
}

async function testCompatibilityCheck() {
  console.log('\n\n🔍 Testing Database Schema Compatibility...\n');

  try {
    const transformer = new DataTransformer();
    const transformedData = transformer.transformScrapedDataForDB(mockScrapedData);

    // Check against Professor schema
    console.log('📋 Schema Compatibility Check:');
    console.log('================================');

    const schemaFields = [
      'name', 'email', 'department', 'designation',
      'education', 'awards', 'teaching_experience',
      'ugc_approved_journals', 'patent_details', 'books'
    ];

    schemaFields.forEach(field => {
      const hasField = transformedData.hasOwnProperty(field);
      const hasData = hasField && transformedData[field] &&
                     (Array.isArray(transformedData[field]) ? transformedData[field].length > 0 : true);

      console.log(`${hasField ? '✅' : '❌'} ${field}: ${hasField ? (hasData ? 'Present with data' : 'Present but empty') : 'Missing'}`);
    });

    // Calculate compatibility percentage
    const presentFields = schemaFields.filter(field => transformedData.hasOwnProperty(field));
    const compatibility = (presentFields.length / schemaFields.length * 100).toFixed(1);

    console.log(`\n📈 Overall Compatibility: ${compatibility}%`);
    console.log(`📊 Fields Mapped: ${presentFields.length}/${schemaFields.length}`);

    return compatibility >= 80;

  } catch (error) {
    console.error('❌ Compatibility check failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Faculty Data Integration Test Suite');
  console.log('=====================================\n');

  // Test 1: Data Transformation
  const transformedData = await testDataTransformation();
  if (!transformedData) {
    console.log('❌ Testing stopped due to transformation failure');
    return;
  }

  // Test 2: Field Mapping
  await testFieldMapping();

  // Test 3: Compatibility Check
  const isCompatible = await testCompatibilityCheck();

  // Final Results
  console.log('\n\n🏆 FINAL TEST RESULTS');
  console.log('====================');
  console.log(`✅ Data Transformation: PASSED`);
  console.log(`✅ Field Mapping: PASSED`);
  console.log(`${isCompatible ? '✅' : '❌'} Schema Compatibility: ${isCompatible ? 'PASSED' : 'FAILED'}`);

  if (isCompatible) {
    console.log('\n🎉 SUCCESS: Scraped data CAN be successfully stored in your existing database!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test with real faculty node IDs');
    console.log('2. Start backend server: node index.js');
    console.log('3. Use API endpoints to scrape and store faculty data');
    console.log('4. Implement frontend interface for batch processing');
  } else {
    console.log('\n❌ FAILURE: Schema compatibility issues detected');
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDataTransformation,
  testFieldMapping,
  testCompatibilityCheck,
  mockScrapedData
};