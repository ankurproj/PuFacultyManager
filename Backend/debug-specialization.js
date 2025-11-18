const axios = require('axios');
const cheerio = require('cheerio');

async function debugSpecialization() {
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

    console.log('\n=== DEBUGGING AREA OF SPECIALIZATION ===\n');

    // Find the Area of Specializaion heading
    const specializationH2 = $('h2:contains("Area of Specializaion"), h2:contains("Area of Specialization")');
    console.log(`Found specialization headings: ${specializationH2.length}`);

    if (specializationH2.length > 0) {
      specializationH2.each((index, element) => {
        console.log(`\nHeading ${index + 1}: "${$(element).text().trim()}"`);

        // Get the parent container
        const parent = $(element).parent();
        console.log(`Parent tag: ${parent.prop('tagName')}`);
        console.log(`Parent classes: ${parent.attr('class') || 'none'}`);

        // Look for content after the heading
        const nextElements = $(element).nextAll();
        console.log(`Elements after heading: ${nextElements.length}`);

        // Check different content patterns
        nextElements.each((i, nextEl) => {
          if (i < 5) { // Check first 5 elements
            const tagName = nextEl.tagName;
            const text = $(nextEl).text().trim();
            const classes = $(nextEl).attr('class') || 'none';
            console.log(`  Next ${i + 1}: <${tagName} class="${classes}"> "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
          }
        });

        // Check siblings
        const siblings = $(element).siblings();
        console.log(`Siblings: ${siblings.length}`);

        siblings.each((i, sibling) => {
          if (i < 3) { // Check first 3 siblings
            const tagName = sibling.tagName;
            const text = $(sibling).text().trim();
            const classes = $(sibling).attr('class') || 'none';
            if (text && text.length < 200) {
              console.log(`  Sibling ${i + 1}: <${tagName} class="${classes}"> "${text}"`);
            }
          }
        });

        // Look for x_panel structure
        const panel = $(element).closest('.x_panel');
        if (panel.length > 0) {
          console.log(`Found x_panel container`);
          const content = panel.find('.x_content');
          if (content.length > 0) {
            console.log(`Found x_content: "${content.text().trim().substring(0, 200)}..."`);
          }
        }
      });
    } else {
      console.log('No specialization headings found');
    }

    // Alternative search - look for any content that might be specialization
    console.log('\n=== SEARCHING FOR SPECIALIZATION CONTENT ===\n');

    // Look for common specialization terms
    const terms = ['Cloud Computing', 'Data Mining', 'Machine Learning', 'Network', 'Database', 'Software Engineering'];

    terms.forEach(term => {
      const elements = $(`*:contains("${term}")`);
      if (elements.length > 0) {
        console.log(`Found "${term}" in ${elements.length} elements`);
        elements.slice(0, 3).each((i, el) => {
          const text = $(el).text().trim();
          const tagName = el.tagName;
          if (text.length < 150) {
            console.log(`  ${tagName}: "${text}"`);
          }
        });
      }
    });

    // Look for all paragraph elements that might contain specialization
    console.log('\n=== ALL PARAGRAPH CONTENT ===\n');
    $('p').each((index, p) => {
      const text = $(p).text().trim();
      if (text && text.length > 10 && text.length < 200) {
        console.log(`P${index + 1}: "${text}"`);
      }
    });

  } catch (error) {
    console.error('Error debugging specialization:', error.message);
  }
}

debugSpecialization();