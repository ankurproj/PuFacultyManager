const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const cheerio = require('cheerio');
const axios = require('axios');

async function analyzeResearchExperienceTable() {
  try {
    console.log('🔍 Analyzing Research Experience Table Structure for Node ID 941...\n');

    const url = 'https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node=941';
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    console.log('📊 Looking for Research Experience in Experience Tab...\n');

    const experienceTab = $('#tab_content2');
    if (experienceTab.length) {
      experienceTab.find('table').each((tableIndex, table) => {
        const tableText = $(table).text().toLowerCase();
        const headers = $(table).find('th').map((i, th) => $(th).text().trim()).get();

        console.log(`Table ${tableIndex}:`);
        console.log(`Headers: ${JSON.stringify(headers)}`);

        // Check if this might be research experience
        if (tableText.includes('research') || headers.some(h => h.toLowerCase().includes('research'))) {
          console.log('🎯 This looks like a research experience table!');

          console.log('\nTable content:');
          $(table).find('tr').each((rowIndex, row) => {
            const cells = $(row).find('td, th');
            const rowData = cells.map((i, cell) => $(cell).text().trim()).get();
            console.log(`Row ${rowIndex}: ${JSON.stringify(rowData)}`);
          });
        }
        console.log('\n' + '='.repeat(50) + '\n');
      });
    }

  } catch (error) {
    console.error('❌ Error analyzing research experience table:', error.message);
  }
}

analyzeResearchExperienceTable();