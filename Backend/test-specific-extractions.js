const FacultyDataScraper = require('./scrapers/facultyDataScraper');

async function testSpecificExtractions() {
  try {
    const scraper = new FacultyDataScraper();
    const nodeId = '941'; // Test faculty

    console.log('Testing specific extraction methods...\n');

    const data = await scraper.scrapeFacultyData(nodeId);

    console.log('=== BASIC INFO ===');
    console.log('Name:', data.name);
    console.log('Department:', data.department);
    console.log('School:', data.school);
    console.log('Email:', data.email);

    console.log('\n=== EDUCATION ===');
    if (data.education && data.education.length > 0) {
      data.education.forEach((edu, index) => {
        console.log(`${index + 1}. ${edu.degree} - ${edu.title} - ${edu.university} (${edu.graduationYear})`);
      });
    } else {
      console.log('No education data found');
    }

    console.log('\n=== AWARDS ===');
    if (data.awards && data.awards.length > 0) {
      data.awards.forEach((award, index) => {
        console.log(`${index + 1}. ${award.title} - ${award.agency} (${award.year})`);
      });
    } else {
      console.log('No awards data found');
    }

    console.log('\n=== TEACHING EXPERIENCE ===');
    if (data.experience.teaching && data.experience.teaching.length > 0) {
      data.experience.teaching.forEach((exp, index) => {
        if (typeof exp === 'object') {
          console.log(`${index + 1}. ${exp.designation} - ${exp.department} - ${exp.institution} ${exp.duration ? '(' + exp.duration + ')' : ''}`);
        } else {
          console.log(`${index + 1}. ${exp}`);
        }
      });
    } else {
      console.log('No teaching experience found');
    }

    console.log('\n=== UGC PAPERS ===');
    if (data.innovation && data.innovation.ugc_papers && data.innovation.ugc_papers.length > 0) {
      data.innovation.ugc_papers.slice(0, 3).forEach((paper, index) => {
        if (typeof paper === 'object') {
          console.log(`${index + 1}. ${paper.title} - ${paper.authors} - ${paper.journal} (${paper.year}) IF: ${paper.impactFactor}`);
        } else {
          console.log(`${index + 1}. ${paper.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('No UGC papers found');
    }

    console.log('\n=== PHD GUIDANCE ===');
    if (data.research_guidance && data.research_guidance.phd_guidance && data.research_guidance.phd_guidance.length > 0) {
      data.research_guidance.phd_guidance.forEach((student, index) => {
        if (typeof student === 'object') {
          console.log(`${index + 1}. ${student.studentName} - ${student.thesisTitle} (${student.registrationNo}) - Awarded: ${student.dateAwarded}`);
        } else {
          console.log(`${index + 1}. ${student}`);
        }
      });
    } else {
      console.log('No PhD guidance found');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSpecificExtractions();