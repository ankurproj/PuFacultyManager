const axios = require('axios');
const cheerio = require('cheerio');

async function testTablesExtraction() {
  try {
    const profileUrl = 'https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node=941';
    console.log('Fetching URL:', profileUrl);

    const response = await axios.get(profileUrl);
    const $ = cheerio.load(response.data);

    console.log('\n=== ALL TABLES ANALYSIS ===');

    $('table').each((index, table) => {
      console.log(`\n--- TABLE ${index + 1} ---`);

      // Check headers
      const headers = $(table).find('th').map((i, th) => $(th).text().trim()).get();
      console.log('Headers:', headers);

      // Check first few rows
      console.log('First 3 data rows:');
      $(table).find('tr').slice(1, 4).each((rowIndex, row) => {
        const cells = $(row).find('td').map((i, td) => $(td).text().trim()).get();
        console.log(`  Row ${rowIndex + 1}:`, cells);
      });

      // Count total rows
      const totalRows = $(table).find('tr').length - 1; // Exclude header
      console.log(`Total data rows: ${totalRows}`);
    });

    // Also check the tab content areas
    console.log('\n=== TAB CONTENT AREAS ===');
    for (let i = 1; i <= 9; i++) {
      const tabContent = $(`#tab_content${i}`);
      if (tabContent.length) {
        const h2Text = tabContent.find('h2').first().text().trim();
        const tableCount = tabContent.find('table').length;
        console.log(`Tab ${i}: "${h2Text}" - ${tableCount} tables`);
      }
    }

  } catch (error) {
    console.error('Error testing tables:', error.message);
  }
}

testTablesExtraction();