const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeHTMLStructure() {
  try {
    const nodeId = '941'; // Example faculty node ID
    const url = `https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node=${nodeId}`;

    console.log('Fetching URL:', url);

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    console.log('\n=== ANALYZING HTML STRUCTURE ===\n');

    // Find all headings
    console.log('=== ALL HEADINGS ===');
    $('h1, h2, h3, h4, h5, h6').each((index, element) => {
      const text = $(element).text().trim();
      const tagName = element.tagName;
      if (text) {
        console.log(`${tagName.toUpperCase()}: ${text}`);
      }
    });

    console.log('\n=== ALL TABLES ===');
    $('table').each((index, table) => {
      console.log(`\nTable ${index + 1}:`);
      $(table).find('tr').each((rowIndex, row) => {
        const cells = [];
        $(row).find('td, th').each((cellIndex, cell) => {
          cells.push($(cell).text().trim());
        });
        if (cells.length > 0) {
          console.log(`  Row ${rowIndex + 1}: ${cells.join(' | ')}`);
        }
      });
    });

    console.log('\n=== NAVIGATION TABS ===');
    $('a[href*="tab"]').each((index, link) => {
      const text = $(link).text().trim();
      const href = $(link).attr('href');
      if (text) {
        console.log(`Tab: ${text} - ${href}`);
      }
    });

    console.log('\n=== SPECIFIC SECTION ANALYSIS ===');

    // Check for different tab content
    const tabs = ['Home', 'Experience', 'Patents/Papers', 'Books', 'Projects/Consultancy', 'Research Guidance', 'Conference/Seminars/Workshops', 'Affiliation/Collaboration', 'Programme'];

    tabs.forEach(tabName => {
      console.log(`\n--- Checking for ${tabName} content ---`);

      // Look for tab content divs
      const tabContent = $(`div[id*="${tabName.toLowerCase()}"], div[class*="${tabName.toLowerCase()}"]`);
      if (tabContent.length > 0) {
        console.log(`Found ${tabName} content div`);
        console.log('Sample content:', tabContent.text().substring(0, 200) + '...');
      }

      // Look for headings with this text
      const headings = $(`h1, h2, h3, h4, h5, h6`).filter((i, el) => {
        return $(el).text().toLowerCase().includes(tabName.toLowerCase());
      });

      if (headings.length > 0) {
        console.log(`Found ${tabName} heading`);
        headings.each((i, heading) => {
          console.log(`  Heading: ${$(heading).text()}`);
        });
      }
    });

  } catch (error) {
    console.error('Error analyzing HTML:', error.message);
  }
}

analyzeHTMLStructure();