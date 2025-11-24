// Removed unused puppeteer import (not utilized in current scraping logic)
const cheerio = require('cheerio');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Reusable axios instance with sane defaults
const axiosClient = axios.create({
  timeout: 10000,
  maxRedirects: 5,
  httpsAgent: new https.Agent({ keepAlive: false })
});

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(urls, options = {}) {
  const {
    attempts = 4,
    backoffBase = 400,
    backoffFactor = 1.8,
    nodeId
  } = options;

  const errors = [];
  for (let attempt = 1; attempt <= attempts; attempt++) {
    for (const url of urls) {
      try {
        const started = Date.now();
        const res = await axiosClient.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Connection': 'close'
          },
          validateStatus: s => s >= 200 && s < 400
        });
        const elapsed = Date.now() - started;
        console.log(`[SCRAPER] Fetched ${url} (status ${res.status}, ${elapsed}ms, attempt ${attempt})`);
        if (!res.data || (typeof res.data === 'string' && res.data.trim().length === 0)) {
          throw new Error('Empty response body');
        }
        return { url, data: res.data };
      } catch (err) {
        const code = err.code || 'UNKNOWN';
        const msg = err.message;
        errors.push({ attempt, url, code, msg });
        console.warn(`[SCRAPER] Attempt ${attempt} failed for ${url} (${code}): ${msg}`);
        // Retry only on transient network errors
        const transient = ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNABORTED', 'ENOTFOUND', 'EPIPE'];
        if (attempt < attempts) {
          const backoff = Math.round(backoffBase * Math.pow(backoffFactor, attempt - 1));
          // Stagger between URLs slightly
          await delay(backoff + Math.floor(Math.random() * 120));
        } else if (!transient.includes(code)) {
          // Non-transient last error -> break early
          break;
        }
      }
    }
  }
  const last = errors[errors.length - 1];
  const summary = errors.map(e => `${e.attempt}:${e.code}`).join(', ');
  throw new Error(`All fetch attempts failed for node ${nodeId}. Last: ${last && last.code} ${last && last.msg}. Attempts: ${summary}`);
}

class FacultyDataScraper {
  constructor() {
    // Allow override via env; default plus fallback hosts list
    this.primaryBase = process.env.FACULTY_PROFILE_BASE_URL || 'https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node=';
    this.fallbackBases = [
      'https://pondiuni.edu.in/PU_Establishment/profile_view/?node=',
      'https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node='
    ];
  }

  /**
   * Scrape faculty data from Pondicherry University profile page
   * @param {string} nodeId - The faculty node ID
   * @returns {Object} Scraped faculty data
   */
  async scrapeFacultyData(nodeId) {
    try {
      console.log(`Scraping data for faculty node: ${nodeId}`);

      const candidateUrls = [
        `${this.primaryBase}${nodeId}`,
        // Avoid duplicates if primary already equals fallback
        ...this.fallbackBases
          .filter(b => b !== this.primaryBase)
          .map(b => `${b}${nodeId}`)
      ];

      console.log(`[SCRAPER] Candidate URLs for node ${nodeId}:`, candidateUrls);
      let fetched;
      try {
        fetched = await fetchWithRetry(candidateUrls, { nodeId });
      } catch (netErr) {
        console.warn(`[SCRAPER] Network fetch failed for node ${nodeId}: ${netErr.message}`);
        const cacheFile = path.join(__dirname, 'cache', `${nodeId}.html`);
        const enablePuppeteer = (process.env.ENABLE_PUPPETEER_FALLBACK || 'true').toLowerCase() === 'true';
        if (enablePuppeteer) {
          try {
            console.log('[SCRAPER] Attempting Puppeteer fallback...');
            const puppeteer = require('puppeteer');
            const browser = await puppeteer.launch({
              headless: 'new',
              args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--ignore-certificate-errors'
              ],
              timeout: 60000
            });
            const page = await browser.newPage();
            page.setDefaultNavigationTimeout(45000);
            let successUrl = null;
            for (const u of candidateUrls) {
              try {
                console.log(`[SCRAPER][PUPPETEER] Navigating to ${u}`);
                await page.goto(u, { waitUntil: 'domcontentloaded' });
                const content = await page.content();
                if (content && content.length > 500) {
                  successUrl = u;
                  // Cache the HTML
                  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
                  fs.writeFileSync(cacheFile, content);
                  console.log(`[SCRAPER][PUPPETEER] Cached HTML to ${cacheFile}`);
                  fetched = { url: u, data: content };
                  break;
                }
              } catch (navErr) {
                console.warn(`[SCRAPER][PUPPETEER] Failed ${u}: ${navErr.message}`);
              }
            }
            await browser.close();
            if (!successUrl) {
              console.warn('[SCRAPER][PUPPETEER] All candidate URLs failed.');
            }
          } catch (puppeteerErr) {
            console.warn(`[SCRAPER] Puppeteer fallback failed: ${puppeteerErr.message}`);
          }
        }
        if (!fetched) {
          if (fs.existsSync(cacheFile)) {
            console.log(`[SCRAPER] Using cached HTML fallback: ${cacheFile}`);
            fetched = { url: `file://${cacheFile}`, data: fs.readFileSync(cacheFile, 'utf-8') };
          } else {
            throw netErr; // rethrow original network error if no fallback
          }
        }
      }
      const $ = cheerio.load(fetched.data);

      const facultyData = {
        // Basic Information
        name: this.extractName($),
        designation: this.extractDesignation($),
        department: this.extractDepartment($),
        school: this.extractSchool($),
        email: this.extractEmail($),
        profileImage: this.extractProfileImage($, nodeId),

        // Home Section
        home: {
          education: this.extractEducation($),
          specialization: this.extractSpecialization($),
          awards: this.extractAwards($),
          researchInterests: this.extractResearchInterests($)
        },

        // Experience Section
        experience: {
          teaching: this.extractTeachingExperience($),
          research: this.extractResearchExperience($),
          industry: this.extractIndustryExperience($)
        },

        // Patents/Papers Section
        innovation: {
          contributions: this.extractInnovationContributions($),
          patents: this.extractPatentDetails($),
          ugc_papers: this.extractUGCApprovedPapers($),
          non_ugc_papers: this.extractNonUGCPapers($),
          conference_papers: this.extractConferencePapers($)
        },

        // Books Section
        books: {
          authored_books: this.extractAuthoredBooks($),
          book_chapters: this.extractBookChapters($),
          edited_books: this.extractEditedBooks($)
        },

        // Projects/Consultancy Section
        projects: {
          ongoing_projects: this.extractOngoingProjects($),
          ongoing_consultancy: this.extractOngoingConsultancy($),
          completed_projects: this.extractCompletedProjects($),
          completed_consultancy: this.extractCompletedConsultancy($)
        },

        // Research Guidance Section
        research_guidance: {
          pg_guidance: this.extractPGGuidance($),
          phd_guidance: this.extractPhDGuidance($),
          postdoc_guidance: this.extractPostDocGuidance($)
        },

        // Conference/Seminars/Workshops Section
        conferences_seminars: {
          e_lectures: this.extractELectures($),
          online_education: this.extractOnlineEducation($),
          invited_talks: this.extractInvitedTalks($),
          organized_conferences: this.extractOrganizedConferences($),
          organized_workshops: this.extractOrganizedWorkshops($)
        },

        // Affiliation/Collaboration Section
        collaboration: {
          academic_administration: this.extractAcademicAdministration($),
          co_curricular: this.extractCoCurricular($),
          institutional_collaboration: this.extractInstitutionalCollaboration($)
        },

        // Programme Section
        programmes: {
          faculty_development: this.extractFacultyDevelopment($),
          executive_development: this.extractExecutiveDevelopment($),
          special_programmes: this.extractSpecialProgrammes($),
          arpit_programmes: this.extractArpitProgrammes($)
        },

        // Meta information
        scraped_date: new Date(),
        source_url: fetched && fetched.url,
        node_id: nodeId
      };

      console.log('Innovation data extracted:');
      console.log('- Contributions:', facultyData.innovation.contributions.length);
      console.log('- Patents:', facultyData.innovation.patents.length);
      console.log('- UGC Papers:', facultyData.innovation.ugc_papers.length);
      console.log('- Non-UGC Papers:', facultyData.innovation.non_ugc_papers.length);
      console.log('- Conference Papers:', facultyData.innovation.conference_papers.length);

      console.log(`Successfully scraped data for node ${nodeId}`);
      return facultyData;

    } catch (error) {
      console.error(`Error scraping faculty data for node ${nodeId}:`, error.message);
      throw new Error(`Failed to scrape faculty data: ${error.message}`);
    }
  }

  /**
   * Extract faculty name from the page
   * Parses h2 tag which contains the name, with optional <small> tag for designation
   * Example: <h2>JAYAKUMAR S.K.V <small>Professor</small></h2>
   */
  extractName($) {
    // Try to get h2 tag (primary location for faculty name)
    const h2Element = $('h2').eq(1);
    if (h2Element.length) {
      // Clone to work with, remove small tag, and get text
      const nameOnly = h2Element.clone();
      nameOnly.find('small').remove();
      const name = nameOnly.text().trim();
      if (name) {
        return name;
      }
    }

    // Fallback to other selectors if h2 doesn't work
    const selectors = ['h1', '.faculty-name', '.name', '.profile-name'];
    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim()) {
        // Remove small tags if present in other elements too
        const nameText = element.clone();
        nameText.find('small').remove();
        const name = nameText.text().trim();
        if (name) {
          return name;
        }
      }
    }
    return '';
  }

  /**
   * Extract faculty designation from the page
   * Parses the <small> tag inside h2 which contains the designation
   * Example: <h2>JAYAKUMAR S.K.V <small>Professor</small></h2>
   * Returns: "Professor"
   */
  extractDesignation($) {
    // Look for small tag inside h2 (primary location)
    const smallInH2 = $('h2 small').eq(1);
    if (smallInH2.length) {
      const designation = smallInH2.text().trim();
      if (designation) {
        return designation;
      }
    }

    // Fallback: Look for small tag anywhere on page
    const smallElement = $('small').first();
    if (smallElement.length) {
      const designation = smallElement.text().trim();
      // Common designation patterns to validate
      const validDesignations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Senior Lecturer', 'Adjunct Professor', 'Visiting Professor', 'Research Scholar', 'Post Doc'];
      if (validDesignations.some(d => designation.toLowerCase().includes(d.toLowerCase()))) {
        return designation;
      }
    }

    return '';
  }

  /**
   * Extract department information
   */
  extractDepartment($) {
    const text = $('body').text();
    const patterns = [
      /Department of ([^\n\r,]+)/i,
      /Dept\. of ([^\n\r,]+)/i,
      /Department:\s*([^\n\r,]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return '';
  }

  /**
   * Extract school information
   */
  extractSchool($) {
    const text = $('body').text();
    const patterns = [
      /School of ([^\n\r,]+)/i,
      /Faculty of ([^\n\r,]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return '';
  }

  /**
   * Extract email address
   * Email is in the 3rd <li> element within <ul class="list-unstyled user_data">
   * Structure: Department, School, Email
   */
  extractEmail($) {
    // Primary method: Look for email in the 3rd li of user_data ul
    const userDataList = $('ul.list-unstyled.user_data li');
    if (userDataList.length >= 3) {
      const thirdLi = userDataList.eq(2); // 0-based index, so 2 = 3rd element
      const emailText = thirdLi.text().trim();

      // Extract email from the text using regex
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const match = emailText.match(emailPattern);
      if (match) {
        return match[0];
      }
    }

    // Fallback method: Search for email pattern in entire body
    const text = $('body').text();
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailPattern);
    return matches ? matches[0] : '';
  }

  /**
   * Extract profile image URL
   */
  extractProfileImage($, nodeId) {
    const imgElement = $('img[src*="employeePhotos/Teaching/Profile"]');
    if (imgElement.length > 0) {
      const src = imgElement.attr('src');
      return src.startsWith('http') ? src : `https://backup.pondiuni.edu.in${src}`;
    }
    return `https://backup.pondiuni.edu.in/Establishment/img/employeePhotos/Teaching/Profile/${nodeId}.jpeg`;
  }

  /**
   * Extract educational qualifications
   */
  extractEducation($) {
    const education = [];

    // Look for the education table in tab_content1 (first tab)
    const educationTab = $('#tab_content1');
    if (educationTab.length) {
      // Find tables with headers that indicate education data
      educationTab.find('table').each((tableIndex, table) => {
        const headers = $(table).find('th').map((i, th) => $(th).text().toLowerCase().trim()).get();

        // Check if this is an education table by looking for degree-related headers
        const isEducationTable = headers.some(h =>
          h.includes('degree') || h.includes('qualification') || h.includes('university') ||
          h.includes('college') || h.includes('institution')
        );

        if (isEducationTable || tableIndex === 0) { // Try first table in education tab
          console.log(`Processing education table ${tableIndex}, rows found: ${$(table).find('tr').length}`);

          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');
            console.log(`Processing row ${rowIndex}, cells: ${cells.length}`);

            if (cells.length >= 3) {
              // Check different possible column arrangements
              let degree = '', title = '', university = '', year = '';

              if (cells.length >= 4) {
                // Possible formats: [S.No, Degree, Title, University, Year] or [Degree, Title, University, Year]
                const firstCol = $(cells[0]).text().trim();
                if (isNaN(firstCol)) { // Not S.No, start from first column
                  degree = $(cells[0]).text().trim();
                  title = $(cells[1]).text().trim();
                  university = $(cells[2]).text().trim();
                  year = $(cells[3]).text().trim();
                } else { // Has S.No column
                  degree = $(cells[1]).text().trim();
                  title = $(cells[2]).text().trim();
                  university = $(cells[3]).text().trim();
                  year = cells.length > 4 ? $(cells[4]).text().trim() : '';
                }
              } else {
                // Fallback for 3 columns
                degree = $(cells[0]).text().trim();
                university = $(cells[1]).text().trim();
                year = $(cells[2]).text().trim();
              }

              console.log(`Extracted: degree="${degree}", university="${university}", title="${title}", year="${year}"`);

              // More flexible validation - just need degree and university to be present
              if (degree && university &&
                  degree.length > 1 && university.length > 3) {

                // Optional: Additional validation for degree patterns (but don't require it)
                const isLikelyDegree = degree.toLowerCase().includes('phd') ||
                                     degree.toLowerCase().includes('m.') ||
                                     degree.toLowerCase().includes('b.') ||
                                     degree.toLowerCase().includes('master') ||
                                     degree.toLowerCase().includes('bachelor') ||
                                     degree.toLowerCase().includes('diploma') ||
                                     degree.toLowerCase().includes('certificate') ||
                                     degree.toLowerCase().includes('degree');

                // Add the education entry (even if it doesn't match common degree patterns)
                const educationEntry = {
                  degree,
                  title: title || '',
                  university,
                  graduationYear: year || ''
                };

                education.push(educationEntry);
                console.log(`Added education entry:`, educationEntry);
              } else {
                console.log(`Skipped row - missing degree or university: degree="${degree}", university="${university}"`);
              }
            } else {
              console.log(`Skipped row - insufficient cells (${cells.length})`);
            }
          });
        }
      });
    }

    return education;
  }

  /**
   * Extract areas of specialization
   * Looks for specialization in x_panel with "Area of Specializaion" heading
   * Structure: <div class="x_panel"> -> <h2>Area of Specializaion</h2> -> <div class="x_content"> -> <p>content</p>
   */
  extractSpecialization($) {
    console.log('Extracting specialization...');

    // Primary method: Look for the specific x_panel structure
    const specializationPanel = $('.x_panel').filter((index, panel) => {
      const h2Text = $(panel).find('h2').text().trim();
      return h2Text.toLowerCase().includes('area of specializ') ||
             h2Text.toLowerCase().includes('specialization') ||
             h2Text.toLowerCase().includes('specializaion'); // Handle typo in original
    });

    if (specializationPanel.length > 0) {
      const contentDiv = specializationPanel.find('.x_content .dashboard-widget-content p');
      if (contentDiv.length > 0) {
        const specializationText = contentDiv.text().trim();
        console.log(`Found specialization in x_panel: "${specializationText}"`);

        if (specializationText) {
          // Split by comma and clean up each area
          const areas = specializationText.split(',').map(area => area.trim()).filter(area => area);
          console.log(`Parsed specialization areas:`, areas);
          return areas;
        }
      }
    }

    // Fallback method: Look for h2 headings (original method)
    console.log('Trying fallback method for specialization...');
    const specializationSection = $('h2:contains("Area of Specializaion"), h2:contains("Area of Specialization")').next();
    const specializationText = specializationSection.text().trim();

    if (specializationText) {
      console.log(`Found specialization via fallback: "${specializationText}"`);
      const areas = specializationText.split(',').map(area => area.trim()).filter(area => area);
      return areas;
    }

    // Additional fallback: Search for any element containing specialization keywords
    const specializationElements = $('*:contains("e-Learning"), *:contains("Cloud Computing"), *:contains("Data Design")').first();
    if (specializationElements.length > 0) {
      const text = specializationElements.text().trim();
      if (text.includes(',')) {
        console.log(`Found specialization via keyword search: "${text}"`);
        const areas = text.split(',').map(area => area.trim()).filter(area => area);
        return areas;
      }
    }

    console.log('No specialization found');
    return [];
  }

  /**
   * Extract awards and recognition
   */
  extractAwards($) {
    const awards = [];

    // Look for awards in the education tab (tab_content1) - should be the second table
    const educationTab = $('#tab_content1');
    if (educationTab.length) {
      educationTab.find('table').each((tableIndex, table) => {
        const headers = $(table).find('th').map((i, th) => $(th).text().toLowerCase().trim()).get();

        // Check if this is an awards table
        const isAwardsTable = headers.some(h =>
          h.includes('award') || h.includes('recognition') || h.includes('honour') ||
          h.includes('achievement') || h.includes('agency')
        );

        if (isAwardsTable) {
          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');

            if (cells.length >= 3) {
              let title = '', type = '', agency = '', year = '', amount = '';

              // Try to map columns based on headers or content
              if (cells.length >= 4) {
                const firstCol = $(cells[0]).text().trim();
                if (isNaN(firstCol)) { // Not S.No
                  title = $(cells[0]).text().trim();
                  type = $(cells[1]).text().trim();
                  agency = $(cells[2]).text().trim();
                  year = $(cells[3]).text().trim();
                  amount = cells.length > 4 ? $(cells[4]).text().trim() : '';
                } else { // Has S.No
                  title = $(cells[1]).text().trim();
                  type = $(cells[2]).text().trim();
                  agency = $(cells[3]).text().trim();
                  year = cells.length > 4 ? $(cells[4]).text().trim() : '';
                  amount = cells.length > 5 ? $(cells[5]).text().trim() : '';
                }
              }

              if (title && agency) {
                awards.push({
                  title,
                  type: type || 'Award',
                  agency,
                  year: year || '',
                  amount: amount || ''
                });
              }
            }
          });
        }
      });
    }

    return awards;
  }

  /**
   * Extract experience information
   */
  extractExperience($) {
    // This would need to be implemented based on the actual structure
    // of experience data on the website
    return [];
  }

  /**
   * Extract publications
   */
  extractPublications($) {
    // This would need to be implemented based on the actual structure
    // of publications data on the website
    return [];
  }

  /**
   * Extract research interests
   */
  extractResearchInterests($) {
    const specialization = this.extractSpecialization($);
    return specialization; // Often research interests are similar to specialization
  }

  // Experience Section Methods
  extractTeachingExperience($) {
    console.log('Extracting teaching experience...');
    const data = [];

    // Look for Teaching Experience in tab_content2
    const teachingTab = $('#tab_content2');
    if (teachingTab.length) {
      teachingTab.find('table').each((tableIndex, table) => {
        const headers = $(table).find('th').map((i, th) => $(th).text().toLowerCase().trim()).get();
        const tableText = $(table).text().toLowerCase();

        // Check if this is teaching experience table (usually first table or contains teaching keywords)
        const isTeachingTable =
          tableIndex === 0 || // First table in teaching tab
          tableText.includes('teaching') ||
          headers.some(h => h.includes('teaching')) ||
          $(table).prev('h3, h4, h5').text().toLowerCase().includes('teaching') ||
          headers.some(h => h.includes('designation') && h.includes('department'));

        if (isTeachingTable) {
          console.log(`Found teaching experience table (index: ${tableIndex})`);

          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');

            if (cells.length >= 3) {
              const firstCol = $(cells[0]).text().trim();
              let designation = '', department = '', institution = '', duration = '';

              if (isNaN(firstCol)) { // Not S.No
                designation = $(cells[0]).text().trim();
                department = $(cells[1]).text().trim();
                institution = $(cells[2]).text().trim();
                duration = cells.length > 3 ? $(cells[3]).text().trim() : '';
              } else { // Has S.No
                designation = $(cells[1]).text().trim();
                department = $(cells[2]).text().trim();
                institution = $(cells[3]).text().trim();
                duration = cells.length > 4 ? $(cells[4]).text().trim() : '';
              }

              // Filter to include only teaching-related positions
              if (designation && institution &&
                  (designation.toLowerCase().includes('professor') ||
                   designation.toLowerCase().includes('lecturer') ||
                   designation.toLowerCase().includes('teacher') ||
                   designation.toLowerCase().includes('teaching') ||
                   designation.toLowerCase().includes('faculty') ||
                   designation.toLowerCase().includes('instructor') ||
                   institution.toLowerCase().includes('university') ||
                   institution.toLowerCase().includes('college') ||
                   institution.toLowerCase().includes('school') ||
                   institution.toLowerCase().includes('institute'))) {
                data.push({
                  designation,
                  department: department || '',
                  institution,
                  duration: duration || ''
                });
                console.log(`Added teaching experience: ${designation} at ${institution}`);
              }
            }
          });
        }
      });
    }

    console.log(`Total teaching experience entries: ${data.length}`);
    return data;
  }

  extractResearchExperience($) {
    console.log('Extracting research experience...');
    const data = [];

    // Look for Research Experience in tab_content2 (Experience tab)
    const experienceTab = $('#tab_content2');
    if (experienceTab.length) {
      experienceTab.find('table').each((tableIndex, table) => {
        const tableText = $(table).text().toLowerCase();
        const headers = $(table).find('th').map((i, th) => $(th).text().toLowerCase().trim()).get();

        // Check if this is research experience table (usually second table or contains research keywords)
        const isResearchTable =
          tableIndex === 1 || // Second table in experience tab
          tableText.includes('research') ||
          headers.some(h => h.includes('research')) ||
          $(table).prev('h3, h4, h5').text().toLowerCase().includes('research');

        if (isResearchTable && headers.some(h => h.includes('designation') || h.includes('institution'))) {
          console.log(`Found research experience table (index: ${tableIndex})`);

          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');

            if (cells.length >= 3) {
              const firstCol = $(cells[0]).text().trim();
              let designation = '', department = '', institution = '', areaOfResearch = '';

              if (isNaN(firstCol)) { // Not S.No
                designation = $(cells[0]).text().trim();
                department = $(cells[1]).text().trim();
                institution = $(cells[2]).text().trim();
                areaOfResearch = cells.length > 3 ? $(cells[3]).text().trim() : '';
              } else { // Has S.No
                designation = $(cells[1]).text().trim();
                department = $(cells[2]).text().trim();
                institution = $(cells[3]).text().trim();
                areaOfResearch = cells.length > 4 ? $(cells[4]).text().trim() : '';
              }

              if (designation && institution &&
                  (designation.toLowerCase().includes('research') ||
                   institution.toLowerCase().includes('research') ||
                   department.toLowerCase().includes('research'))) {
                data.push({
                  designation,
                  department: department || '',
                  institution,
                  areaOfResearch: areaOfResearch || '',
                  duration: '' // Duration not available in source table
                });
                console.log(`Added research experience: ${designation} at ${institution} (${areaOfResearch})`);
              }
            }
          });
        }
      });
    }

    // Fallback: Look for dedicated research experience sections
    if (data.length === 0) {
      const researchSections = this.extractSectionData($, [
        'Research Experience',
        'Research Background'
      ]);
      data.push(...researchSections);
    }

    console.log(`Total research experience entries: ${data.length}`);
    return data;
  }

  extractIndustryExperience($) {
    console.log('Extracting industry experience...');
    const data = [];

    // Look for Industry Experience table with specific headers: S.No, Designation, Company/Corporate, Nature of Work
    const experienceTab = $('#tab_content2');
    if (experienceTab.length) {
      experienceTab.find('table').each((tableIndex, table) => {
        const headers = $(table).find('th').map((i, th) => $(th).text().trim()).get();
        console.log(`Table ${tableIndex} headers:`, headers);

        // Check if this is the industry experience table by looking for specific headers
        const hasIndustryHeaders =
          headers.some(h => h.toLowerCase().includes('designation')) &&
          (headers.some(h => h.toLowerCase().includes('company') || h.toLowerCase().includes('corporate')) ||
           headers.some(h => h.toLowerCase().includes('nature') && h.toLowerCase().includes('work')));

        // Also check if table is preceded by "Industry Experience" heading
        const prevHeading = $(table).prevAll('h2, h3, h4, h5').first().text().toLowerCase();
        const isIndustrySection = prevHeading.includes('industry') ||
                                 prevHeading.includes('corporate') ||
                                 tableIndex === 2; // Third table in experience tab

        if ((hasIndustryHeaders || isIndustrySection) && headers.length >= 3) {
          console.log(`Found industry experience table (index: ${tableIndex})`);
          console.log('Headers:', headers);

          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');

            if (cells.length >= 3) {
              // Handle table structure: S.No | Designation | Company/Corporate | Nature of Work
              let designation = '', company = '', natureOfWork = '';

              if (cells.length === 4) {
                // Full structure with S.No
                designation = $(cells[1]).text().trim();
                company = $(cells[2]).text().trim();
                natureOfWork = $(cells[3]).text().trim();
              } else if (cells.length === 3) {
                // Structure without S.No: Designation | Company/Corporate | Nature of Work
                designation = $(cells[0]).text().trim();
                company = $(cells[1]).text().trim();
                natureOfWork = $(cells[2]).text().trim();
              }

              // Add entry if we have valid data
              if (designation && company && designation !== 'Designation' && company !== 'Company/Corporate') {
                data.push({
                  designation: designation,
                  department: '', // Not available in industry table
                  institution: company, // Using company as institution for consistency
                  duration: natureOfWork || '', // Using nature of work as duration/notes
                  company: company,
                  natureOfWork: natureOfWork || ''
                });
                console.log(`Added industry experience: ${designation} at ${company} - ${natureOfWork}`);
              }
            }
          });
        }
      });
    }

    // Fallback: Look for dedicated industry experience sections
    if (data.length === 0) {
      console.log('No industry table found, trying section-based extraction...');
      const industrySections = this.extractSectionData($, [
        'Industry Experience',
        'Industrial Experience',
        'Professional Experience',
        'Corporate Experience'
      ]);
      data.push(...industrySections);
    }

    console.log(`Total industry experience entries: ${data.length}`);
    return data;
  }

  // Innovation/Patents Section Methods
  extractInnovationContributions($) {
    console.log('Extracting innovation contributions...');
    const data = [];

    // Look for Innovation Contributions in tab_content3 (Patents/Papers tab)
    console.log('Available tabs:', $('[id*="tab_content"]').map((i, el) => $(el).attr('id')).get());
    const patentsTab = $('#tab_content3');
    console.log('Patents tab found:', patentsTab.length > 0);

    if (patentsTab.length) {
      console.log('Total tables in patents tab:', patentsTab.find('table').length);

      patentsTab.find('table').each((tableIndex, table) => {
        const headers = $(table).find('th').map((i, th) => $(th).text().trim()).get();
        const tableText = $(table).text().toLowerCase();
        console.log(`Table ${tableIndex} headers:`, headers);
        console.log(`Table ${tableIndex} contains "contribution":`, tableText.includes('contribution'));
        console.log(`Table ${tableIndex} contains "specialization":`, tableText.includes('specialization'));

        // More flexible detection - check for any contribution-related keywords
        const isInnovationTable =
          tableIndex === 0 || // First table in patents tab
          tableText.includes('contribution') ||
          tableText.includes('innovation') ||
          headers.some(h => h.toLowerCase().includes('work') || h.toLowerCase().includes('contribution')) ||
          headers.some(h => h.toLowerCase().includes('specialization')) ||
          headers.some(h => h.toLowerCase().includes('remarks'));

        if (isInnovationTable && headers.length >= 3) {
          console.log(`Processing innovation contributions table (index: ${tableIndex})`);

          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');
            console.log(`Row ${rowIndex} has ${cells.length} cells`);

            if (cells.length >= 3) {
              let workName = '', specialization = '', remarks = '';

              // Try different column structures
              if (cells.length >= 4) {
                // Structure: S.No | Name of Work/Contribution | Specialization | Remarks
                workName = $(cells[1]).text().trim();
                specialization = $(cells[2]).text().trim();
                remarks = $(cells[3]).text().trim();
              } else {
                // Structure: Name of Work/Contribution | Specialization | Remarks
                workName = $(cells[0]).text().trim();
                specialization = $(cells[1]).text().trim();
                remarks = $(cells[2]).text().trim();
              }

              console.log(`Potential work: "${workName}", specialization: "${specialization}"`);

              if (workName && workName !== 'Name of the Work/Contribution' && workName !== 'S.No' && !isNaN(workName) === false) {
                data.push({
                  workName: workName,
                  specialization: specialization || '',
                  remarks: remarks || ''
                });
                console.log(`Added innovation contribution: ${workName}`);
              }
            }
          });
        } else {
          console.log(`Skipping table ${tableIndex} - not innovation table`);
        }
      });
    } else {
      console.log('Patents tab (#tab_content3) not found');
    }

    // Fallback: If no data found, try to extract from any table with enough columns
    if (data.length === 0 && patentsTab.length) {
      console.log('Fallback: Trying to extract from any table with 4+ columns...');
      patentsTab.find('table').each((tableIndex, table) => {
        const rows = $(table).find('tr');
        if (rows.length > 1) {
          const firstRow = $(rows[1]).find('td');
          if (firstRow.length >= 4) {
            console.log(`Attempting fallback extraction from table ${tableIndex}`);
            // Try to extract assuming: S.No | Work/Title | Description/Specialization | Notes/Remarks
            const workName = $(firstRow[1]).text().trim();
            const specialization = $(firstRow[2]).text().trim();
            const remarks = $(firstRow[3]).text().trim();

            if (workName && workName !== 'Title' && workName !== 'S.No') {
              data.push({
                workName: workName,
                specialization: specialization || '',
                remarks: remarks || ''
              });
              console.log(`Fallback added: ${workName}`);
            }
          }
        }
      });
    }

    console.log(`Total innovation contributions: ${data.length}`);
    return data;
  }

  extractPatentDetails($) {
    console.log('Extracting patent details...');
    const data = [];

    // Look for Patent Details in tab_content3 (Patents/Papers tab)
    const patentsTab = $('#tab_content3');
    if (patentsTab.length) {
      patentsTab.find('table').each((tableIndex, table) => {
        const headers = $(table).find('th').map((i, th) => $(th).text().trim()).get();
        const tableText = $(table).text().toLowerCase();
        console.log(`Patent table ${tableIndex} headers:`, headers);

        // More flexible patent detection
        const isPatentTable =
          tableIndex === 1 || // Second table in patents tab
          tableText.includes('patent') ||
          headers.some(h => h.toLowerCase().includes('title')) &&
          (headers.some(h => h.toLowerCase().includes('status')) ||
           headers.some(h => h.toLowerCase().includes('patent')) ||
           headers.some(h => h.toLowerCase().includes('commercialized')));

        if (isPatentTable && headers.length >= 4) {
          console.log(`Processing patent details table (index: ${tableIndex})`);

          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');

            if (cells.length >= 4) {
              let title = '', status = '', patentNumber = '', yearOfAward = '', type = '', commercializedStatus = '';

              // Try different column structures
              if (cells.length >= 7) {
                // Full structure: S.No | Title | Status | Patent Number | Year of Award | Type | Commercialized Status
                title = $(cells[1]).text().trim();
                status = $(cells[2]).text().trim();
                patentNumber = $(cells[3]).text().trim();
                yearOfAward = $(cells[4]).text().trim();
                type = $(cells[5]).text().trim();
                commercializedStatus = $(cells[6]).text().trim();
              } else if (cells.length >= 6) {
                // Without S.No: Title | Status | Patent Number | Year | Type | Commercialized
                title = $(cells[0]).text().trim();
                status = $(cells[1]).text().trim();
                patentNumber = $(cells[2]).text().trim();
                yearOfAward = $(cells[3]).text().trim();
                type = $(cells[4]).text().trim();
                commercializedStatus = $(cells[5]).text().trim();
              } else {
                // Minimal structure: extract what we can
                title = $(cells[0]).text().trim();
                status = cells.length > 1 ? $(cells[1]).text().trim() : '';
                patentNumber = cells.length > 2 ? $(cells[2]).text().trim() : '';
                yearOfAward = cells.length > 3 ? $(cells[3]).text().trim() : '';
              }

              if (title && title !== 'Title' && title !== 'S.No' && !isNaN(title) === false) {
                data.push({
                  title: title,
                  status: status || '',
                  patentNumber: patentNumber || '',
                  yearOfAward: yearOfAward || '',
                  type: type || '',
                  commercializedStatus: commercializedStatus || ''
                });
                console.log(`Added patent: ${title}`);
              }
            }
          });
        }
      });
    }

    console.log(`Total patents: ${data.length}`);
    return data;
  }

  extractUGCApprovedPapers($) {
    console.log('Extracting UGC approved papers...');
    const data = [];

    // Track which tables have been processed to avoid conflicts
    if (!this.processedTables) {
      this.processedTables = new Set();
    }

    // Look for UGC papers in tab_content3 (Patents/Papers tab)
    const patentsTab = $('#tab_content3');
    if (patentsTab.length) {
      patentsTab.find('table').each((tableIndex, table) => {
        const headers = $(table).find('th').map((i, th) => $(th).text().trim()).get();
        const tableText = $(table).text().toLowerCase();
        console.log(`UGC table ${tableIndex} headers:`, headers);

        // More specific UGC papers detection - exclude Non-UGC tables
        const hasUGCKeywords = tableText.includes('ugc approved') || tableText.includes('ugc journal');
        const hasNonUGCKeywords = tableText.includes('non ugc') || tableText.includes('non-ugc');
        const hasPeerReviewedOnly = tableText.includes('peer reviewed') && !tableText.includes('ugc');

        console.log(`UGC Table ${tableIndex} analysis:`);
        console.log(`- Has UGC keywords: ${hasUGCKeywords}`);
        console.log(`- Has Non-UGC keywords: ${hasNonUGCKeywords}`);
        console.log(`- Has peer reviewed only: ${hasPeerReviewedOnly}`);
        console.log(`- Table text snippet: "${tableText.substring(0, 100)}..."`);

        const isUGCTable =
          hasUGCKeywords || // Explicit UGC keywords
          (tableIndex === 2 && !hasNonUGCKeywords && !hasPeerReviewedOnly) || // Third table, clean of non-UGC indicators
          (tableText.includes('ugc') && !hasNonUGCKeywords &&
           headers.some(h => h.toLowerCase().includes('title')) &&
           headers.some(h => h.toLowerCase().includes('authors')));

        console.log(`UGC Table ${tableIndex} decision: ${isUGCTable ? 'PROCESS' : 'SKIP'}`);

        if (isUGCTable && headers.length >= 5 && !this.processedTables.has(`ugc_${tableIndex}`)) {
          console.log(`Processing UGC papers table (index: ${tableIndex})`);
          this.processedTables.add(`ugc_${tableIndex}`);

          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');

            if (cells.length >= 5) {
              let title = '', authors = '', journalName = '', volumeIssuePages = '', year = '', impactFactor = '';

              // Try different column structures
              if (cells.length >= 7) {
                // Full structure: S.No | Title | Authors | Journal Name | Volume/Issue/Page | Year | Impact Factor
                title = $(cells[1]).text().trim();
                authors = $(cells[2]).text().trim();
                journalName = $(cells[3]).text().trim();
                volumeIssuePages = $(cells[4]).text().trim();
                year = $(cells[5]).text().trim();
                impactFactor = $(cells[6]).text().trim();
              } else if (cells.length >= 6) {
                // Without S.No: Title | Authors | Journal | Volume/Issue | Year | Impact Factor
                title = $(cells[0]).text().trim();
                authors = $(cells[1]).text().trim();
                journalName = $(cells[2]).text().trim();
                volumeIssuePages = $(cells[3]).text().trim();
                year = $(cells[4]).text().trim();
                impactFactor = $(cells[5]).text().trim();
              } else {
                // Minimal structure: extract what we can
                title = $(cells[0]).text().trim();
                authors = cells.length > 1 ? $(cells[1]).text().trim() : '';
                journalName = cells.length > 2 ? $(cells[2]).text().trim() : '';
                year = cells.length > 3 ? $(cells[3]).text().trim() : '';
                impactFactor = cells.length > 4 ? $(cells[4]).text().trim() : '';
              }

              if (title && title !== 'Title' && title !== 'S.No' && !isNaN(title) === false) {
                data.push({
                  title: title,
                  authors: authors || '',
                  journalName: journalName || '',
                  volumeIssuePages: volumeIssuePages || '',
                  year: year || '',
                  impactFactor: impactFactor || ''
                });
                console.log(`Added UGC paper: ${title}`);
              }
            }
          });
        }
      });
    }

    console.log(`Total UGC papers: ${data.length}`);
    return data;
  }

  extractNonUGCPapers($) {
    console.log('Extracting Non-UGC papers...');
    const data = [];

    // Look for Non-UGC papers in tab_content3 (Patents/Papers tab)
    const patentsTab = $('#tab_content3');
    if (patentsTab.length) {
      patentsTab.find('table').each((tableIndex, table) => {
        const headers = $(table).find('th').map((i, th) => $(th).text().trim()).get();
        const tableText = $(table).text().toLowerCase();
        console.log(`Non-UGC table ${tableIndex} headers:`, headers);

        // More specific Non-UGC papers detection
        const hasExplicitNonUGC = tableText.includes('non ugc') || tableText.includes('non-ugc');
        const hasUGCApproved = tableText.includes('ugc approved') || tableText.includes('ugc journal');
        const hasPeerReviewedWithoutUGC = tableText.includes('peer reviewed') && !tableText.includes('ugc');

        console.log(`Non-UGC Table ${tableIndex} analysis:`);
        console.log(`- Has explicit Non-UGC: ${hasExplicitNonUGC}`);
        console.log(`- Has UGC approved: ${hasUGCApproved}`);
        console.log(`- Has peer reviewed without UGC: ${hasPeerReviewedWithoutUGC}`);
        console.log(`- Table text snippet: "${tableText.substring(0, 100)}..."`);

        const isNonUGCTable =
          hasExplicitNonUGC || // Explicit non-ugc mention
          hasPeerReviewedWithoutUGC || // Peer reviewed but not UGC
          (tableIndex === 3 && !hasUGCApproved && // Fourth table, not UGC approved
           headers.some(h => h.toLowerCase().includes('title')) &&
           headers.some(h => h.toLowerCase().includes('authors')) &&
           headers.some(h => h.toLowerCase().includes('journal')));

        console.log(`Non-UGC Table ${tableIndex} decision: ${isNonUGCTable ? 'PROCESS' : 'SKIP'}`);

        if (isNonUGCTable && headers.length >= 5 && !this.processedTables.has(`ugc_${tableIndex}`)) {
          console.log(`Processing Non-UGC papers table (index: ${tableIndex})`);
          this.processedTables.add(`nonugc_${tableIndex}`);

          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');

            if (cells.length >= 5) {
              let title = '', authors = '', journalName = '', volumeIssuePages = '', year = '', impactFactor = '';

              // Try different column structures
              if (cells.length >= 7) {
                // Full structure: S.No | Title | Authors | Journal Name | Volume/Issue/Page | Year | Impact Factor
                title = $(cells[1]).text().trim();
                authors = $(cells[2]).text().trim();
                journalName = $(cells[3]).text().trim();
                volumeIssuePages = $(cells[4]).text().trim();
                year = $(cells[5]).text().trim();
                impactFactor = $(cells[6]).text().trim();
              } else if (cells.length >= 6) {
                // Without S.No: Title | Authors | Journal | Volume/Issue | Year | Impact Factor
                title = $(cells[0]).text().trim();
                authors = $(cells[1]).text().trim();
                journalName = $(cells[2]).text().trim();
                volumeIssuePages = $(cells[3]).text().trim();
                year = $(cells[4]).text().trim();
                impactFactor = $(cells[5]).text().trim();
              } else {
                // Minimal structure: extract what we can
                title = $(cells[0]).text().trim();
                authors = cells.length > 1 ? $(cells[1]).text().trim() : '';
                journalName = cells.length > 2 ? $(cells[2]).text().trim() : '';
                year = cells.length > 3 ? $(cells[3]).text().trim() : '';
                impactFactor = cells.length > 4 ? $(cells[4]).text().trim() : '';
              }

              if (title && title !== 'Title' && title !== 'S.No' && !isNaN(title) === false) {
                data.push({
                  title: title,
                  authors: authors || '',
                  journalName: journalName || '',
                  volumeIssuePages: volumeIssuePages || '',
                  year: year || '',
                  impactFactor: impactFactor || ''
                });
                console.log(`Added Non-UGC paper: ${title}`);
              }
            }
          });
        }
      });
    }

    console.log(`Total Non-UGC papers: ${data.length}`);
    return data;
  }

  extractConferencePapers($) {
    console.log('Extracting conference papers...');
    const data = [];

    // Look for Conference papers in tab_content3 (Patents/Papers tab)
    const patentsTab = $('#tab_content3');
    if (patentsTab.length) {
      patentsTab.find('table').each((tableIndex, table) => {
        const headers = $(table).find('th').map((i, th) => $(th).text().trim()).get();
        const tableText = $(table).text().toLowerCase();
        console.log(`Conference table ${tableIndex} headers:`, headers);

        // More flexible conference papers detection
        const isConferenceTable =
          tableIndex === 4 || // Fifth table in patents tab
          tableText.includes('conference') ||
          tableText.includes('proceedings') ||
          (headers.some(h => h.toLowerCase().includes('title')) &&
           headers.some(h => h.toLowerCase().includes('authors')) &&
           (headers.some(h => h.toLowerCase().includes('conference')) ||
            headers.some(h => h.toLowerCase().includes('proceedings')) ||
            headers.some(h => h.toLowerCase().includes('page')) &&
            !headers.some(h => h.toLowerCase().includes('impact factor')))); // Key difference from journal papers

        if (isConferenceTable && headers.length >= 4) {
          console.log(`Processing conference papers table (index: ${tableIndex})`);

          $(table).find('tr').slice(1).each((rowIndex, row) => {
            const cells = $(row).find('td');

            if (cells.length >= 4) {
              let title = '', authors = '', conferenceDetails = '', pageNos = '', year = '';

              // Try different column structures
              if (cells.length >= 6) {
                // Full structure: S.No | Title | Authors | Conference Details | Page Nos | Year
                title = $(cells[1]).text().trim();
                authors = $(cells[2]).text().trim();
                conferenceDetails = $(cells[3]).text().trim();
                pageNos = $(cells[4]).text().trim();
                year = $(cells[5]).text().trim();
              } else if (cells.length >= 5) {
                // Without S.No: Title | Authors | Conference Details | Page Nos | Year
                title = $(cells[0]).text().trim();
                authors = $(cells[1]).text().trim();
                conferenceDetails = $(cells[2]).text().trim();
                pageNos = $(cells[3]).text().trim();
                year = $(cells[4]).text().trim();
              } else {
                // Minimal structure: extract what we can
                title = $(cells[0]).text().trim();
                authors = cells.length > 1 ? $(cells[1]).text().trim() : '';
                conferenceDetails = cells.length > 2 ? $(cells[2]).text().trim() : '';
                year = cells.length > 3 ? $(cells[3]).text().trim() : '';
              }

              if (title && title !== 'Title' && title !== 'S.No' && !isNaN(title) === false) {
                data.push({
                  title: title,
                  authors: authors || '',
                  conferenceDetails: conferenceDetails || '',
                  pageNos: pageNos || '',
                  year: year || ''
                });
                console.log(`Added conference paper: ${title}`);
              }
            }
          });
        }
      });
    }

    console.log(`Total conference papers: ${data.length}`);
    return data;
  }

  // Books Section Methods
  extractAuthoredBooks($) {
    return this.extractBookTableData($, [
      'Books',
      'Authored Books',
      'Published Books',
      'Book Publications',
      'Books Published',
      'Authored Publications',
      'Books Written',
      'Written Books'
    ], 'books');
  }

  extractBookChapters($) {
    return this.extractBookTableData($, [
      'Chapters in Books',
      'Book Chapters',
      'Chapters',
      'Chapter Publications',
      'Chapters Published',
      'Book Chapter',
      'Edited Chapters',
      'Contributed Chapters'
    ], 'chapters');
  }

  extractEditedBooks($) {
    return this.extractBookTableData($, [
      'Edited Books',
      'Books Edited',
      'Editorial Work',
      'Edited Publications',
      'Editorial Contributions',
      'Books as Editor',
      'Editor Books',
      'Edited Volumes'
    ], 'edited');
  }

  // Enhanced book table extraction method
  extractBookTableData($, keywords, type) {
    console.log(`\n--- Extracting ${type} Book Data ---`);
    const books = [];

    // Focus on Books tab (tab_content4) as specified by user
    const booksTab = $('#tab_content4');

    if (booksTab.length === 0) {
      console.log('Books tab (tab_content4) not found');
      return books;
    }

    console.log(`Found Books tab with ${booksTab.find('table').length} tables`);

    // Look for panels with specific titles based on the HTML structure provided
    let targetPanels = [];

    if (type === 'books') {
      // Look for panel with "Books" heading
      targetPanels = booksTab.find('.x_panel').filter((i, panel) => {
        const heading = $(panel).find('.x_title h2').text().trim().toLowerCase();
        return heading === 'books';
      });
    } else if (type === 'chapters') {
      // Look for panel with "Chapters" or "Chapters in Books" heading
      targetPanels = booksTab.find('.x_panel').filter((i, panel) => {
        const heading = $(panel).find('.x_title h2').text().trim().toLowerCase();
        return heading.includes('chapter');
      });
    } else if (type === 'edited') {
      // Look for panel with "Edited Books" heading
      targetPanels = booksTab.find('.x_panel').filter((i, panel) => {
        const heading = $(panel).find('.x_title h2').text().trim().toLowerCase();
        return heading.includes('edited');
      });
    }

    if (targetPanels.length > 0) {
      console.log(`Found ${targetPanels.length} matching panel(s) for ${type}`);

      targetPanels.each((panelIndex, panel) => {
        const $panel = $(panel);
        const panelTitle = $panel.find('.x_title h2').text().trim();
        console.log(`\n=== Processing Panel: "${panelTitle}" ===`);

        // Find tables in this specific panel
        const tables = $panel.find('table');
        console.log(`Panel has ${tables.length} table(s)`);

        tables.each((tableIndex, table) => {
          const $table = $(table);
          console.log(`\nProcessing table ${tableIndex + 1} in "${panelTitle}" panel`);

          // Check if this table has the expected book structure
          const headerRow = $table.find('thead tr').first();
          if (headerRow.length === 0) {
            console.log('No thead found, skipping table');
            return;
          }

          const headers = headerRow.find('th').map((i, th) => $(th).text().trim()).get();
          console.log(`Table headers: ${headers.join(' | ')}`);

          // Verify this looks like the book table structure
          const hasBookStructure = headers.includes('S.No') &&
                                  headers.some(h => h.toLowerCase().includes('title')) &&
                                  headers.some(h => h.toLowerCase().includes('author')) &&
                                  headers.includes('Publisher') &&
                                  headers.includes('Year');

          if (hasBookStructure) {
            console.log(`✓ Table has correct book structure - extracting data`);
            this.parseCleanBookTable($, $table, books);
          } else {
            console.log(`✗ Table doesn't match expected book structure`);
          }
        });
      });
    } else {
      console.log(`No panels found for ${type}, falling back to table-based search`);

      // Fallback: search all tables in the tab
      const tables = booksTab.find('table');
      tables.each((tableIndex, table) => {
        const $table = $(table);

        // Quick check if this looks like a book table
        const headers = $table.find('th').map((i, th) => $(th).text().trim()).get();
        const hasBookStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('title')) &&
                                headers.some(h => h.toLowerCase().includes('author'));

        if (hasBookStructure) {
          console.log(`Found book table (fallback) - extracting data`);
          this.parseCleanBookTable($, $table, books);
        }
      });
    }

    console.log(`Total ${type} books extracted: ${books.length}`);
    return books;
  }

  // Simple, clean book table parser based on the exact HTML structure provided by user
  parseCleanBookTable($, $table, books) {
    console.log('Parsing clean book table with HTML structure: <th scope="row"> for S.No, <td> for rest');

    const rows = $table.find('tr');
    if (rows.length < 2) return; // Need at least header + 1 data row

    // Skip header row and process data rows
    rows.slice(1).each((rowIndex, row) => {
      const $row = $(row);

      // The HTML structure uses <th scope="row"> for S.No and <td> for other columns
      const snoCell = $row.find('th[scope="row"]'); // S.No is in <th scope="row">
      const dataCells = $row.find('td'); // Rest are in <td>

      console.log(`Row ${rowIndex + 1}: Found ${snoCell.length} S.No cells, ${dataCells.length} data cells`);

      if (snoCell.length > 0 && dataCells.length >= 5) {
        // Extract data according to the exact HTML structure you provided
        const sno = snoCell.text().trim();
        const title = $(dataCells[0]).text().trim(); // Title of the Book
        const authors = $(dataCells[1]).text().trim(); // Name of the Authors as per the order in Book
        const publisher = $(dataCells[2]).text().trim(); // Publisher
        const year = $(dataCells[3]).text().trim(); // Year
        const isbn = $(dataCells[4]).text().trim(); // ISBN No.

        console.log(`Extracted: S.No="${sno}", Title="${title}", Authors="${authors}", Publisher="${publisher}", Year="${year}", ISBN="${isbn}"`);

        // Only add if we have actual book content
        if (title && title !== 'Title of the Book' && authors && authors !== 'Name of the Authors as per the order in Book') {
          const bookEntry = {
            sno: sno,
            title: title,
            authors: authors,
            publisher: publisher,
            year: year,
            isbn: isbn || 'N/A'
          };

          books.push(bookEntry);
          console.log(`✅ Successfully added book: "${title}" by ${authors} (${year})`);
        } else {
          console.log(`⚠️ Skipped row - appears to be header or empty: title="${title}", authors="${authors}"`);
        }
      } else {
        console.log(`⚠️ Row ${rowIndex + 1} doesn't match expected structure: ${snoCell.length} S.No cells, ${dataCells.length} data cells`);
      }
    });
  }



  // Projects/Consultancy Section Methods - Enhanced for structured table extraction
  extractOngoingProjects($) {
    return this.extractProjectConsultancyTable($, [
      'Ongoing Projects',
      'Current Projects',
      'Active Projects'
    ], 'projects');
  }

  extractOngoingConsultancy($) {
    return this.extractProjectConsultancyTable($, [
      'Ongoing Consultancy Works',
      'Ongoing Consultancy',
      'Current Consultancy',
      'Active Consultancy'
    ], 'consultancy');
  }

  extractCompletedProjects($) {
    return this.extractProjectConsultancyTable($, [
      'Completed Projects',
      'Finished Projects',
      'Past Projects'
    ], 'projects');
  }

  extractCompletedConsultancy($) {
    return this.extractProjectConsultancyTable($, [
      'Completed Consultancy Works',
      'Completed Consultancy',
      'Finished Consultancy',
      'Past Consultancy'
    ], 'consultancy');
  }

  // Enhanced project/consultancy table extraction method
  extractProjectConsultancyTable($, keywords, type) {
    console.log(`\n--- Extracting ${type} Data ---`);
    const items = [];

    // Focus on Projects/Consultancy tab (tab_content5) as specified by user
    const projectsTab = $('#tab_content5');

    if (projectsTab.length === 0) {
      console.log('Projects/Consultancy tab (tab_content5) not found');
      return items;
    }

    console.log(`Found Projects/Consultancy tab with ${projectsTab.find('table').length} tables`);

    // Look for panels with specific titles based on the HTML structure
    let targetPanels = [];

    // Search for panels matching our keywords
    projectsTab.find('.x_panel').each((i, panel) => {
      const $panel = $(panel);
      const heading = $panel.find('.x_title h2').text().trim();

      console.log(`Checking panel: "${heading}"`);

      const headingLower = heading.toLowerCase();
      const matchesKeywords = keywords.some(keyword =>
        headingLower.includes(keyword.toLowerCase())
      );

      if (matchesKeywords) {
        console.log(`✓ Panel "${heading}" matches keywords`);
        targetPanels.push(panel);
      }
    });

    if (targetPanels.length > 0) {
      console.log(`Found ${targetPanels.length} matching panel(s)`);

      targetPanels.forEach((panel, panelIndex) => {
        const $panel = $(panel);
        const panelTitle = $panel.find('.x_title h2').text().trim();
        console.log(`\n=== Processing Panel: "${panelTitle}" ===`);

        // Find tables in this specific panel
        const tables = $panel.find('table');
        console.log(`Panel has ${tables.length} table(s)`);

        tables.each((tableIndex, table) => {
          const $table = $(table);
          console.log(`\nProcessing table ${tableIndex + 1} in "${panelTitle}" panel`);

          // Check if this table has the expected project/consultancy structure
          const headerRow = $table.find('thead tr').first();
          if (headerRow.length === 0) {
            console.log('No thead found, skipping table');
            return;
          }

          const headers = headerRow.find('th').map((i, th) => $(th).text().trim()).get();
          console.log(`Table headers: ${headers.join(' | ')}`);

          // Verify this looks like the project/consultancy table structure
          const hasProjectStructure = headers.includes('S.No') &&
                                    (headers.some(h => h.toLowerCase().includes('title')) ||
                                     headers.some(h => h.toLowerCase().includes('project')) ||
                                     headers.some(h => h.toLowerCase().includes('consultancy'))) &&
                                    headers.some(h => h.toLowerCase().includes('sponsored')) &&
                                    headers.some(h => h.toLowerCase().includes('period')) &&
                                    (headers.some(h => h.toLowerCase().includes('amount')) ||
                                     headers.some(h => h.toLowerCase().includes('sanctioned')));

          if (hasProjectStructure) {
            console.log(`✓ Table has correct project/consultancy structure - extracting data`);
            this.parseProjectConsultancyTable($, $table, items, type);
          } else {
            console.log(`✗ Table doesn't match expected project/consultancy structure`);
          }
        });
      });
    } else {
      console.log(`No panels found, falling back to table-based search`);

      // Fallback: search all tables in the tab
      const tables = projectsTab.find('table');
      tables.each((tableIndex, table) => {
        const $table = $(table);

        // Quick check if this looks like a project/consultancy table
        const headers = $table.find('th').map((i, th) => $(th).text().trim()).get();
        const hasProjectStructure = headers.includes('S.No') &&
                                  headers.some(h => h.toLowerCase().includes('title')) &&
                                  headers.some(h => h.toLowerCase().includes('sponsored'));

        if (hasProjectStructure) {
          console.log(`Found project/consultancy table (fallback) - extracting data`);
          this.parseProjectConsultancyTable($, $table, items, type);
        }
      });
    }

    console.log(`Total ${type} items extracted: ${items.length}`);
    return items;
  }

  // Parse project/consultancy table with the exact structure: S.No | Title | Sponsored By | Period | Sanctioned Amount | Year
  parseProjectConsultancyTable($, $table, items, type) {
    console.log(`Parsing ${type} table with structured format`);

    const rows = $table.find('tr');
    if (rows.length < 2) return; // Need at least header + 1 data row

    // Skip header row and process data rows
    rows.slice(1).each((rowIndex, row) => {
      const $row = $(row);

      // Handle both <th scope="row"> and <td> for S.No
      const snoCell = $row.find('th[scope="row"]');
      const dataCells = $row.find('td');

      let sno, title, sponsoredBy, period, sanctionedAmount, year;

      if (snoCell.length > 0 && dataCells.length >= 5) {
        // Structure: <th scope="row">S.No</th> + 5 <td> elements
        sno = snoCell.text().trim();
        title = $(dataCells[0]).text().trim();
        sponsoredBy = $(dataCells[1]).text().trim();
        period = $(dataCells[2]).text().trim();
        sanctionedAmount = $(dataCells[3]).text().trim();
        year = $(dataCells[4]).text().trim();
      } else if (dataCells.length >= 6) {
        // All in <td> elements: S.No | Title | Sponsored By | Period | Amount | Year
        sno = $(dataCells[0]).text().trim();
        title = $(dataCells[1]).text().trim();
        sponsoredBy = $(dataCells[2]).text().trim();
        period = $(dataCells[3]).text().trim();
        sanctionedAmount = $(dataCells[4]).text().trim();
        year = $(dataCells[5]).text().trim();
      } else {
        console.log(`⚠️ Row ${rowIndex + 1} doesn't match expected structure`);
        return;
      }

      console.log(`Extracted: S.No="${sno}", Title="${title}", Sponsored="${sponsoredBy}", Period="${period}", Amount="${sanctionedAmount}", Year="${year}"`);

      // Only add if we have actual content
      if (title && title !== 'Title of the Project' && title !== 'Title of the Consultancy Work' &&
          sponsoredBy && sponsoredBy !== 'Sponsored By') {

        const item = {
          sno: sno,
          title: title,
          sponsoredBy: sponsoredBy,
          period: period,
          sanctionedAmount: sanctionedAmount,
          year: year
        };

        items.push(item);
        console.log(`✅ Successfully added ${type}: "${title}" (${year})`);
      } else {
        console.log(`⚠️ Skipped row - appears to be header or empty: title="${title}", sponsored="${sponsoredBy}"`);
      }
    });
  }

  // Research Guidance Section Methods
  extractPGGuidance($) {
    return this.extractResearchGuidanceTable($, [
      'Research Guidance - PG',
      'PG Guidance',
      'Postgraduate Guidance',
      'Masters Guidance'
    ], 'pg');
  }

  extractPhDGuidance($) {
    return this.extractResearchGuidanceTable($, [
      'Research Guidance - Ph.D',
      'Research Guidance - PhD',
      'Ph.D Guidance',
      'PhD Guidance',
      'Doctoral Guidance'
    ], 'phd');
  }

  extractPostDocGuidance($) {
    return this.extractResearchGuidanceTable($, [
      'Research Guidance - Post Doctoral',
      'Post Doctoral Guidance',
      'Postdoc Guidance',
      'Post Doc Guidance'
    ], 'postdoc');
  }

  // Enhanced research guidance table extraction method
  extractResearchGuidanceTable($, keywords, type) {
    console.log(`\n--- Extracting ${type} Research Guidance Data ---`);
    const items = [];

    // Focus on Research Guidance tab (tab_content6) as specified by user
    const guidanceTab = $('#tab_content6');

    if (guidanceTab.length === 0) {
      console.log('Research Guidance tab (tab_content6) not found');
      return items;
    }

    console.log(`Found Research Guidance tab with ${guidanceTab.find('table').length} tables`);

    // Look for panels with specific titles based on the HTML structure
    let targetPanels = [];

    // Search for panels matching our keywords
    guidanceTab.find('.x_panel').each((i, panel) => {
      const $panel = $(panel);
      const heading = $panel.find('.x_title h2').text().trim();

      console.log(`Checking panel: "${heading}"`);

      const headingLower = heading.toLowerCase();
      const matchesKeywords = keywords.some(keyword =>
        headingLower.includes(keyword.toLowerCase())
      );

      if (matchesKeywords) {
        console.log(`✓ Panel "${heading}" matches keywords`);
        targetPanels.push(panel);
      }
    });

    if (targetPanels.length > 0) {
      console.log(`Found ${targetPanels.length} matching panel(s)`);

      targetPanels.forEach((panel, panelIndex) => {
        const $panel = $(panel);
        const panelTitle = $panel.find('.x_title h2').text().trim();
        console.log(`\n=== Processing Panel: "${panelTitle}" ===`);

        // Find tables in this specific panel
        const tables = $panel.find('table');
        console.log(`Panel has ${tables.length} table(s)`);

        tables.each((tableIndex, table) => {
          const $table = $(table);
          console.log(`\nProcessing table ${tableIndex + 1} in "${panelTitle}" panel`);

          // Check if this table has the expected research guidance structure
          const headerRow = $table.find('thead tr').first();
          if (headerRow.length === 0) {
            console.log('No thead found, skipping table');
            return;
          }

          const headers = headerRow.find('th').map((i, th) => $(th).text().trim()).get();
          console.log(`Table headers: ${headers.join(' | ')}`);

          // Verify this looks like the research guidance table structure based on type
          let hasCorrectStructure = false;

          if (type === 'pg') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('year')) &&
                                headers.some(h => h.toLowerCase().includes('degree')) &&
                                headers.some(h => h.toLowerCase().includes('students')) &&
                                headers.some(h => h.toLowerCase().includes('department'));
          } else if (type === 'phd') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('student')) &&
                                headers.some(h => h.toLowerCase().includes('registration')) &&
                                headers.some(h => h.toLowerCase().includes('thesis')) &&
                                headers.some(h => h.toLowerCase().includes('status'));
          } else if (type === 'postdoc') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('scholar')) &&
                                headers.some(h => h.toLowerCase().includes('designation')) &&
                                headers.some(h => h.toLowerCase().includes('funding')) &&
                                headers.some(h => h.toLowerCase().includes('fellowship'));
          }

          if (hasCorrectStructure) {
            console.log(`✓ Table has correct ${type} research guidance structure - extracting data`);
            this.parseResearchGuidanceTable($, $table, items, type);
          } else {
            console.log(`✗ Table doesn't match expected ${type} research guidance structure`);
          }
        });
      });
    } else {
      console.log(`No panels found, falling back to table-based search`);

      // Fallback: search all tables in the tab
      const tables = guidanceTab.find('table');
      tables.each((tableIndex, table) => {
        const $table = $(table);

        // Quick check if this looks like a research guidance table
        const headers = $table.find('th').map((i, th) => $(th).text().trim()).get();
        const hasGuidanceStructure = headers.includes('S.No') &&
                                   (headers.some(h => h.toLowerCase().includes('student')) ||
                                    headers.some(h => h.toLowerCase().includes('scholar')) ||
                                    headers.some(h => h.toLowerCase().includes('degree')));

        if (hasGuidanceStructure) {
          console.log(`Found research guidance table (fallback) - extracting data`);
          this.parseResearchGuidanceTable($, $table, items, type);
        }
      });
    }

    console.log(`Total ${type} research guidance items extracted: ${items.length}`);
    return items;
  }

  // Parse research guidance table based on type (PG, PhD, PostDoc)
  parseResearchGuidanceTable($, $table, items, type) {
    console.log(`Parsing ${type} research guidance table`);

    const rows = $table.find('tr');
    if (rows.length < 2) return; // Need at least header + 1 data row

    // Skip header row and process data rows
    rows.slice(1).each((rowIndex, row) => {
      const $row = $(row);

      // Handle both <th scope="row"> and <td> for S.No
      const snoCell = $row.find('th[scope="row"]');
      const dataCells = $row.find('td');

      let item = {};

      if (type === 'pg') {
        // PG Table: S.No | Year | Degree | No. of Students Awarded | Department/Centre
        if (snoCell.length > 0 && dataCells.length >= 4) {
          item = {
            sno: snoCell.text().trim(),
            year: $(dataCells[0]).text().trim(),
            degree: $(dataCells[1]).text().trim(),
            studentsAwarded: $(dataCells[2]).text().trim(),
            department: $(dataCells[3]).text().trim()
          };
        } else if (dataCells.length >= 5) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            year: $(dataCells[1]).text().trim(),
            degree: $(dataCells[2]).text().trim(),
            studentsAwarded: $(dataCells[3]).text().trim(),
            department: $(dataCells[4]).text().trim()
          };
        }
      } else if (type === 'phd') {
        // PhD Table: S.No | Student Name | Registration Date | Registration No. | Thesis Title | Thesis Submitted Status | Thesis Submitted Date | Vivavoce Completed Status | Date Awarded
        if (snoCell.length > 0 && dataCells.length >= 8) {
          item = {
            sno: snoCell.text().trim(),
            studentName: $(dataCells[0]).text().trim(),
            registrationDate: $(dataCells[1]).text().trim(),
            registrationNo: $(dataCells[2]).text().trim(),
            thesisTitle: $(dataCells[3]).text().trim(),
            thesisSubmittedStatus: $(dataCells[4]).text().trim(),
            thesisSubmittedDate: $(dataCells[5]).text().trim(),
            vivavoceCompletedStatus: $(dataCells[6]).text().trim(),
            dateAwarded: $(dataCells[7]).text().trim()
          };
        } else if (dataCells.length >= 9) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            studentName: $(dataCells[1]).text().trim(),
            registrationDate: $(dataCells[2]).text().trim(),
            registrationNo: $(dataCells[3]).text().trim(),
            thesisTitle: $(dataCells[4]).text().trim(),
            thesisSubmittedStatus: $(dataCells[5]).text().trim(),
            thesisSubmittedDate: $(dataCells[6]).text().trim(),
            vivavoceCompletedStatus: $(dataCells[7]).text().trim(),
            dateAwarded: $(dataCells[8]).text().trim()
          };
        }
      } else if (type === 'postdoc') {
        // PostDoc Table: S.No | Scholar Name | Designation | Funding Agency | Fellowship Title | Year of Joining | Year of Completion
        if (snoCell.length > 0 && dataCells.length >= 6) {
          item = {
            sno: snoCell.text().trim(),
            scholarName: $(dataCells[0]).text().trim(),
            designation: $(dataCells[1]).text().trim(),
            fundingAgency: $(dataCells[2]).text().trim(),
            fellowshipTitle: $(dataCells[3]).text().trim(),
            yearOfJoining: $(dataCells[4]).text().trim(),
            yearOfCompletion: $(dataCells[5]).text().trim()
          };
        } else if (dataCells.length >= 7) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            scholarName: $(dataCells[1]).text().trim(),
            designation: $(dataCells[2]).text().trim(),
            fundingAgency: $(dataCells[3]).text().trim(),
            fellowshipTitle: $(dataCells[4]).text().trim(),
            yearOfJoining: $(dataCells[5]).text().trim(),
            yearOfCompletion: $(dataCells[6]).text().trim()
          };
        }
      }

      // Only add if we have actual content
      if (item.sno && Object.keys(item).length > 1) {
        // Check if this is not just headers
        const isHeader = (type === 'pg' && item.year === 'Year') ||
                        (type === 'phd' && item.studentName === 'Student Name') ||
                        (type === 'postdoc' && item.scholarName === 'Scholar Name');

        if (!isHeader) {
          items.push(item);
          console.log(`✅ Successfully added ${type} item: S.No ${item.sno}`);
        } else {
          console.log(`⚠️ Skipped header row`);
        }
      } else {
        console.log(`⚠️ Row ${rowIndex + 1} doesn't have sufficient data or structure`);
      }
    });
  }

  // Conference/Seminars Section Methods - Enhanced for structured table extraction
  extractELectures($) {
    console.log('Starting E-Lecture extraction...');
    return this.extractConferenceSeminarTable($, [
      'E-Lecture Details',
      'E-Lectures',
      'Online Lectures',
      'Digital Lectures',
      'e-lecture'
    ], 'e_lectures');
  }

  extractOnlineEducation($) {
    return this.extractConferenceSeminarTable($, [
      'Details of Online Education Conducted',
      'Online Education',
      'Virtual Teaching'
    ], 'online_education');
  }

  extractInvitedTalks($) {
    return this.extractConferenceSeminarTable($, [
      'Invited Talks in Conference/Seminar/Workshop/Training Programme',
      'Invited Talks',
      'Guest Lectures',
      'Keynote Speeches'
    ], 'invited_talks');
  }

  extractOrganizedConferences($) {
    return this.extractConferenceSeminarTable($, [
      'Conferences/Seminars Organized',
      'Organized Conferences',
      'Conferences Organized'
    ], 'organized_conferences');
  }

  extractOrganizedWorkshops($) {
    return this.extractConferenceSeminarTable($, [
      'Workshop Organized',
      'Workshops Organized',
      'Training Programs Organized'
    ], 'organized_workshops');
  }

  // Enhanced conference/seminar table extraction method
  extractConferenceSeminarTable($, keywords, type) {
    console.log(`\n--- Extracting ${type} Data ---`);
    const items = [];

    // Focus on Conferences/Seminars/Workshops tab (tab_content7) as specified by user
    const conferencesTab = $('#tab_content7');

    if (conferencesTab.length === 0) {
      console.log('Conferences/Seminars/Workshops tab (tab_content7) not found');
      return items;
    }

    console.log(`Found Conferences/Seminars/Workshops tab with ${conferencesTab.find('table').length} tables`);

    // Look for panels with specific titles based on the HTML structure
    let targetPanels = [];

    // Search for panels matching our keywords
    conferencesTab.find('.x_panel').each((i, panel) => {
      const $panel = $(panel);
      const heading = $panel.find('.x_title h2').text().trim();

      console.log(`Checking panel: "${heading}"`);

      const headingLower = heading.toLowerCase();
      const matchesKeywords = keywords.some(keyword =>
        headingLower.includes(keyword.toLowerCase())
      );

      if (matchesKeywords) {
        console.log(`✓ Panel "${heading}" matches keywords`);
        targetPanels.push(panel);
      }
    });

    if (targetPanels.length > 0) {
      console.log(`Found ${targetPanels.length} matching panel(s)`);

      targetPanels.forEach((panel, panelIndex) => {
        const $panel = $(panel);
        const panelTitle = $panel.find('.x_title h2').text().trim();
        console.log(`\n=== Processing Panel: "${panelTitle}" ===`);

        // Find tables in this specific panel
        const tables = $panel.find('table');
        console.log(`Panel has ${tables.length} table(s)`);

        tables.each((tableIndex, table) => {
          const $table = $(table);
          console.log(`\nProcessing table ${tableIndex + 1} in "${panelTitle}" panel`);

          // Check if this table has the expected conference/seminar structure
          const headerRow = $table.find('thead tr').first();
          if (headerRow.length === 0) {
            console.log('No thead found, skipping table');
            return;
          }

          const headers = headerRow.find('th').map((i, th) => $(th).text().trim()).get();
          console.log(`Table headers: ${headers.join(' | ')}`);

          // Verify this looks like the conference/seminar table structure based on type
          let hasCorrectStructure = false;

          if (type === 'e_lectures') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('lecture')) &&
                                headers.some(h => h.toLowerCase().includes('title')) &&
                                headers.some(h => h.toLowerCase().includes('institution'));
          } else if (type === 'online_education') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('nature')) &&
                                headers.some(h => h.toLowerCase().includes('sessions')) &&
                                headers.some(h => h.toLowerCase().includes('target'));
          } else if (type === 'invited_talks') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('title')) &&
                                headers.some(h => h.toLowerCase().includes('conference')) &&
                                headers.some(h => h.toLowerCase().includes('organized'));
          } else if (type === 'organized_conferences') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('title')) &&
                                headers.some(h => h.toLowerCase().includes('sponsors')) &&
                                headers.some(h => h.toLowerCase().includes('venue'));
          } else if (type === 'organized_workshops') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('title')) &&
                                headers.some(h => h.toLowerCase().includes('sponsors')) &&
                                headers.some(h => h.toLowerCase().includes('venue'));
          }

          if (hasCorrectStructure) {
            console.log(`✓ Table has correct ${type} structure - extracting data`);
            this.parseConferenceSeminarTable($, $table, items, type);
          } else {
            console.log(`✗ Table doesn't match expected ${type} structure`);
          }
        });
      });
    } else {
      console.log(`No panels found, falling back to table-based search`);

      // Fallback: search all tables in the tab
      const tables = conferencesTab.find('table');
      tables.each((tableIndex, table) => {
        const $table = $(table);

        // Quick check if this looks like a conference/seminar table
        const headers = $table.find('th').map((i, th) => $(th).text().trim()).get();
        const hasConferenceStructure = headers.includes('S.No') &&
                                     (headers.some(h => h.toLowerCase().includes('title')) ||
                                      headers.some(h => h.toLowerCase().includes('lecture')) ||
                                      headers.some(h => h.toLowerCase().includes('conference')));

        if (hasConferenceStructure) {
          console.log(`Found conference/seminar table (fallback) - extracting data`);
          this.parseConferenceSeminarTable($, $table, items, type);
        }
      });
    }

    console.log(`Total ${type} items extracted: ${items.length}`);
    return items;
  }

  // Enhanced collaboration table extraction method
  extractCollaborationTable($, keywords, type) {
    console.log(`\n--- Extracting ${type} Data ---`);
    const items = [];

    // Focus on Affiliation/Collaboration tab (tab_content8) as specified by user
    const collaborationTab = $('#tab_content8');

    if (collaborationTab.length === 0) {
      console.log('Affiliation/Collaboration tab (tab_content8) not found');
      return items;
    }

    console.log(`Found Affiliation/Collaboration tab with ${collaborationTab.find('table').length} tables`);

    // Look for panels with specific titles based on the HTML structure
    let targetPanels = [];

    // Search for panels matching our keywords
    collaborationTab.find('.x_panel').each((i, panel) => {
      const $panel = $(panel);
      const heading = $panel.find('.x_title h2').text().trim();

      console.log(`Checking panel: "${heading}"`);

      const headingLower = heading.toLowerCase();
      const matchesKeywords = keywords.some(keyword =>
        headingLower.includes(keyword.toLowerCase())
      );

      if (matchesKeywords) {
        console.log(`✓ Panel "${heading}" matches keywords`);
        targetPanels.push(panel);
      }
    });

    if (targetPanels.length > 0) {
      console.log(`Found ${targetPanels.length} matching panel(s)`);

      targetPanels.forEach((panel, panelIndex) => {
        const $panel = $(panel);
        const panelTitle = $panel.find('.x_title h2').text().trim();
        console.log(`\n=== Processing Panel: "${panelTitle}" ===`);

        // Find tables in this specific panel
        const tables = $panel.find('table');
        console.log(`Panel has ${tables.length} table(s)`);

        tables.each((tableIndex, table) => {
          const $table = $(table);
          console.log(`\nProcessing table ${tableIndex + 1} in "${panelTitle}" panel`);

          // Check if this table has the expected collaboration structure
          const headerRow = $table.find('thead tr').first();
          if (headerRow.length === 0) {
            console.log('No thead found, skipping table');
            return;
          }

          const headers = headerRow.find('th').map((i, th) => $(th).text().trim()).get();
          console.log(`Table headers: ${headers.join(' | ')}`);

          // Verify this looks like the collaboration table structure based on type
          let hasCorrectStructure = false;

          if (type === 'academic_administration') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('position')) &&
                                headers.some(h => h.toLowerCase().includes('duration')) &&
                                (headers.some(h => h.toLowerCase().includes('duties')) ||
                                 headers.some(h => h.toLowerCase().includes('dutites')));
          } else if (type === 'co_curricular') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('position')) &&
                                headers.some(h => h.toLowerCase().includes('duration')) &&
                                (headers.some(h => h.toLowerCase().includes('duties')) ||
                                 headers.some(h => h.toLowerCase().includes('dutites')));
          } else if (type === 'institutional_collaboration') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('collaborator')) &&
                                headers.some(h => h.toLowerCase().includes('institution')) &&
                                headers.some(h => h.toLowerCase().includes('collaboration'));
          }

          if (hasCorrectStructure) {
            console.log(`✓ Table has correct ${type} structure - extracting data`);
            this.parseCollaborationTable($, $table, items, type);
          } else {
            console.log(`✗ Table doesn't match expected ${type} structure`);
          }
        });
      });
    } else {
      console.log(`No panels found, falling back to table-based search`);

      // Fallback: search all tables in the tab
      const tables = collaborationTab.find('table');
      tables.each((tableIndex, table) => {
        const $table = $(table);

        // Quick check if this looks like a collaboration table
        const headers = $table.find('th').map((i, th) => $(th).text().trim()).get();
        const hasCollaborationStructure = headers.includes('S.No') &&
                                        (headers.some(h => h.toLowerCase().includes('position')) ||
                                         headers.some(h => h.toLowerCase().includes('collaborator')) ||
                                         headers.some(h => h.toLowerCase().includes('institution')));

        if (hasCollaborationStructure) {
          console.log(`Found collaboration table (fallback) - extracting data`);
          this.parseCollaborationTable($, $table, items, type);
        }
      });
    }

    console.log(`Total ${type} items extracted: ${items.length}`);
    return items;
  }

  // Parse conference/seminar table based on type
  parseConferenceSeminarTable($, $table, items, type) {
    console.log(`Parsing ${type} conference/seminar table`);

    const rows = $table.find('tr');
    if (rows.length < 2) return; // Need at least header + 1 data row

    // Skip header row and process data rows
    rows.slice(1).each((rowIndex, row) => {
      const $row = $(row);

      // Handle both <th scope="row"> and <td> for S.No
      const snoCell = $row.find('th[scope="row"]');
      const dataCells = $row.find('td');

      let item = {};

      if (type === 'e_lectures') {
        // E-Lectures: S.No | E-Lecture Title | Content/Module Title | Institution/Platform | Year | Weblink | Member of Editorial Bodies | Reviewer/Referee of
        // Handle complex header structure with colspan/rowspan - data is in 8 columns total
        if (snoCell.length > 0 && dataCells.length >= 7) {
          // S.No is in <th scope="row">, rest are in <td>
          item = {
            sno: snoCell.text().trim(),
            lectureTitle: $(dataCells[0]).text().trim(),
            contentTitle: $(dataCells[1]).text().trim(),
            institution: $(dataCells[2]).text().trim(),
            year: $(dataCells[3]).text().trim(),
            weblink: $(dataCells[4]).text().trim(),
            editorialBodies: $(dataCells[5]).text().trim() || '',
            reviewer: $(dataCells[6]).text().trim() || ''
          };
        } else if (dataCells.length >= 8) {
          // All cells are <td> including S.No
          item = {
            sno: $(dataCells[0]).text().trim(),
            lectureTitle: $(dataCells[1]).text().trim(),
            contentTitle: $(dataCells[2]).text().trim(),
            institution: $(dataCells[3]).text().trim(),
            year: $(dataCells[4]).text().trim(),
            weblink: $(dataCells[5]).text().trim(),
            editorialBodies: $(dataCells[6]).text().trim() || '',
            reviewer: $(dataCells[7]).text().trim() || ''
          };
        }
      } else if (type === 'online_education') {
        // Online Education: S.No | Nature of Online Course | No. of Sessions | Target Group | Date
        if (snoCell.length > 0 && dataCells.length >= 4) {
          item = {
            sno: snoCell.text().trim(),
            nature: $(dataCells[0]).text().trim(),
            sessions: $(dataCells[1]).text().trim(),
            targetGroup: $(dataCells[2]).text().trim(),
            date: $(dataCells[3]).text().trim()
          };
        } else if (dataCells.length >= 5) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            nature: $(dataCells[1]).text().trim(),
            sessions: $(dataCells[2]).text().trim(),
            targetGroup: $(dataCells[3]).text().trim(),
            date: $(dataCells[4]).text().trim()
          };
        }
      } else if (type === 'invited_talks') {
        // Invited Talks: S.No | Title of the Paper | Conferences/Seminar/Workshop/Training Programme | Organized by | Whether International / National / State / Regional / College or University Level | From | To | Year
        if (snoCell.length > 0 && dataCells.length >= 7) {
          item = {
            sno: snoCell.text().trim(),
            paperTitle: $(dataCells[0]).text().trim(),
            programme: $(dataCells[1]).text().trim(),
            organizedBy: $(dataCells[2]).text().trim(),
            level: $(dataCells[3]).text().trim(),
            fromDate: $(dataCells[4]).text().trim(),
            toDate: $(dataCells[5]).text().trim(),
            year: $(dataCells[6]).text().trim()
          };
        } else if (dataCells.length >= 8) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            paperTitle: $(dataCells[1]).text().trim(),
            programme: $(dataCells[2]).text().trim(),
            organizedBy: $(dataCells[3]).text().trim(),
            level: $(dataCells[4]).text().trim(),
            fromDate: $(dataCells[5]).text().trim(),
            toDate: $(dataCells[6]).text().trim(),
            year: $(dataCells[7]).text().trim()
          };
        }
      } else if (type === 'organized_conferences') {
        // Organized Conferences: S.No | Title of the Programme | Sponsors | Venue & Duration | Whether International / National / State / Regional / College or University Level | From | To | Year
        if (snoCell.length > 0 && dataCells.length >= 7) {
          item = {
            sno: snoCell.text().trim(),
            programmeTitle: $(dataCells[0]).text().trim(),
            sponsors: $(dataCells[1]).text().trim(),
            venue: $(dataCells[2]).text().trim(),
            level: $(dataCells[3]).text().trim(),
            fromDate: $(dataCells[4]).text().trim(),
            toDate: $(dataCells[5]).text().trim(),
            year: $(dataCells[6]).text().trim()
          };
        } else if (dataCells.length >= 8) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            programmeTitle: $(dataCells[1]).text().trim(),
            sponsors: $(dataCells[2]).text().trim(),
            venue: $(dataCells[3]).text().trim(),
            level: $(dataCells[4]).text().trim(),
            fromDate: $(dataCells[5]).text().trim(),
            toDate: $(dataCells[6]).text().trim(),
            year: $(dataCells[7]).text().trim()
          };
        }
      } else if (type === 'organized_workshops') {
        // Organized Workshops: S.No | Title of the Programme | Sponsors | Venue & Duration | Whether International / National / State / Regional / College or University Level | From | To | Year
        if (snoCell.length > 0 && dataCells.length >= 7) {
          item = {
            sno: snoCell.text().trim(),
            programmeTitle: $(dataCells[0]).text().trim(),
            sponsors: $(dataCells[1]).text().trim(),
            venue: $(dataCells[2]).text().trim(),
            level: $(dataCells[3]).text().trim(),
            fromDate: $(dataCells[4]).text().trim(),
            toDate: $(dataCells[5]).text().trim(),
            year: $(dataCells[6]).text().trim()
          };
        } else if (dataCells.length >= 8) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            programmeTitle: $(dataCells[1]).text().trim(),
            sponsors: $(dataCells[2]).text().trim(),
            venue: $(dataCells[3]).text().trim(),
            level: $(dataCells[4]).text().trim(),
            fromDate: $(dataCells[5]).text().trim(),
            toDate: $(dataCells[6]).text().trim(),
            year: $(dataCells[7]).text().trim()
          };
        }
      }

      // Only add if we have actual content
      if (item.sno && Object.keys(item).length > 1) {
        // Check if this is not just headers
        const isHeader = (type === 'e_lectures' && item.lectureTitle === 'E-Lecture Title') ||
                        (type === 'online_education' && item.nature === 'Nature of Online Course') ||
                        (type === 'invited_talks' && item.paperTitle === 'Title of the Paper') ||
                        (type === 'organized_conferences' && item.programmeTitle === 'Title of the Programme') ||
                        (type === 'organized_workshops' && item.programmeTitle === 'Title of the Programme');

        if (!isHeader) {
          items.push(item);
          console.log(`✅ Successfully added ${type} item: S.No ${item.sno}`);
        } else {
          console.log(`⚠️ Skipped header row`);
        }
      } else {
        console.log(`⚠️ Row ${rowIndex + 1} doesn't have sufficient data or structure`);
      }
    });
  }

  // Parse collaboration table based on type
  parseCollaborationTable($, $table, items, type) {
    console.log(`Parsing ${type} collaboration table`);

    const rows = $table.find('tr');
    if (rows.length < 2) return; // Need at least header + 1 data row

    // Skip header row and process data rows
    rows.slice(1).each((rowIndex, row) => {
      const $row = $(row);

      // Handle both <th scope="row"> and <td> for S.No
      const snoCell = $row.find('th[scope="row"]');
      const dataCells = $row.find('td');

      let item = {};

      if (type === 'academic_administration') {
        // Academic Administration: S.No | Name of the Position (Head, Dean, Co-ordinator, Director, etc.,) | Duration | Nature of Duties
        if (snoCell.length > 0 && dataCells.length >= 3) {
          item = {
            sno: snoCell.text().trim(),
            position: $(dataCells[0]).text().trim(),
            duration: $(dataCells[1]).text().trim(),
            duties: $(dataCells[2]).text().trim()
          };
          console.log(`Found academic administration row: ${item.position} (${item.duration})`);
        } else if (dataCells.length >= 4) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            position: $(dataCells[1]).text().trim(),
            duration: $(dataCells[2]).text().trim(),
            duties: $(dataCells[3]).text().trim()
          };
          console.log(`Found academic administration row (alt): ${item.position} (${item.duration})`);
        }
      } else if (type === 'co_curricular') {
        // Co-Curricular: S.No | Name of the Position (NSS, NCC, Warden etc.,) | Duration | Nature of Duties
        if (snoCell.length > 0 && dataCells.length >= 3) {
          item = {
            sno: snoCell.text().trim(),
            position: $(dataCells[0]).text().trim(),
            duration: $(dataCells[1]).text().trim(),
            duties: $(dataCells[2]).text().trim()
          };
          console.log(`Found co-curricular row: ${item.position} (${item.duration})`);
        } else if (dataCells.length >= 4) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            position: $(dataCells[1]).text().trim(),
            duration: $(dataCells[2]).text().trim(),
            duties: $(dataCells[3]).text().trim()
          };
          console.log(`Found co-curricular row (alt): ${item.position} (${item.duration})`);
        }
      } else if (type === 'institutional_collaboration') {
        // Institutional Collaboration: S.No | Collaborator Name | Designation | Institution/Industry | Type | Nature of Collaboration | Period of Collaboration (From Date | To Date) | Visits to Collaborating Institution/Industry (From Date | To Date) | Details of Collaborative Research/Teaching
        if (snoCell.length > 0 && dataCells.length >= 9) {
          item = {
            sno: snoCell.text().trim(),
            collaboratorName: $(dataCells[0]).text().trim(),
            designation: $(dataCells[1]).text().trim(),
            institution: $(dataCells[2]).text().trim(),
            type: $(dataCells[3]).text().trim(),
            natureOfCollaboration: $(dataCells[4]).text().trim(),
            periodFromDate: $(dataCells[5]).text().trim(),
            periodToDate: $(dataCells[6]).text().trim(),
            visitFromDate: $(dataCells[7]).text().trim(),
            visitToDate: $(dataCells[8]).text().trim(),
            collaborativeDetails: dataCells.length > 9 ? $(dataCells[9]).text().trim() : ''
          };
        } else if (dataCells.length >= 10) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            collaboratorName: $(dataCells[1]).text().trim(),
            designation: $(dataCells[2]).text().trim(),
            institution: $(dataCells[3]).text().trim(),
            type: $(dataCells[4]).text().trim(),
            natureOfCollaboration: $(dataCells[5]).text().trim(),
            periodFromDate: $(dataCells[6]).text().trim(),
            periodToDate: $(dataCells[7]).text().trim(),
            visitFromDate: $(dataCells[8]).text().trim(),
            visitToDate: $(dataCells[9]).text().trim(),
            collaborativeDetails: dataCells.length > 10 ? $(dataCells[10]).text().trim() : ''
          };
        }
      }

      // Only add if we have actual content
      if (item.sno && Object.keys(item).length > 1) {
        // Check if this is not just headers
        const isHeader = (type === 'academic_administration' && item.position === 'Name of the Position') ||
                        (type === 'co_curricular' && item.position === 'Name of the Position') ||
                        (type === 'institutional_collaboration' && item.collaboratorName === 'Collaborator Name');

        if (!isHeader) {
          items.push(item);
          console.log(`✅ Successfully added ${type} item: S.No ${item.sno}`);
        } else {
          console.log(`⚠️ Skipped header row`);
        }
      } else {
        console.log(`⚠️ Row ${rowIndex + 1} doesn't have sufficient data or structure`);
      }
    });
  }

  // Collaboration Section Methods - Enhanced for structured table extraction
  extractAcademicAdministration($) {
    console.log('Starting Academic Administration extraction...');
    return this.extractCollaborationTable($, [
      'Participation & Extension Activities (Academic/Administraion)',
      'Participation & Extension Activities (Academic/Administration)',
      'Academic/Administraion',
      'Academic/Administration',
      'Academic Administration',
      'Administrative Position',
      'Academic Position'
    ], 'academic_administration');
  }

  extractCoCurricular($) {
    console.log('Starting Co-Curricular extraction...');
    return this.extractCollaborationTable($, [
      'Participation & Extension Activities (Co-Curricular)',
      'Co-Curricular Activities',
      'NSS Activities',
      'NCC Activities',
      'NSS Programme',
      'Co-Curricular'
    ], 'co_curricular');
  }

  extractInstitutionalCollaboration($) {
    console.log('Starting Institutional Collaboration extraction...');
    return this.extractCollaborationTable($, [
      'Collaboration with Institution/Industry',
      'Institutional Collaboration',
      'Industry Collaboration',
      'Research Collaboration'
    ], 'institutional_collaboration');
  }

  // Enhanced programme table extraction method
  extractProgrammeTable($, keywords, type) {
    console.log(`\n--- Extracting ${type} Data ---`);
    const items = [];

    // Focus on Programme tab (tab_content9) as specified by user
    const programmeTab = $('#tab_content9');

    if (programmeTab.length === 0) {
      console.log('Programme tab (tab_content9) not found');
      return items;
    }

    console.log(`Found Programme tab with ${programmeTab.find('table').length} tables`);

    // Look for panels with specific titles based on the HTML structure
    let targetPanels = [];

    // Search for panels matching our keywords
    programmeTab.find('.x_panel').each((i, panel) => {
      const $panel = $(panel);
      const heading = $panel.find('.x_title h2').text().trim();

      console.log(`Checking panel: "${heading}"`);

      const headingLower = heading.toLowerCase();
      const matchesKeywords = keywords.some(keyword =>
        headingLower.includes(keyword.toLowerCase())
      );

      if (matchesKeywords) {
        console.log(`✓ Panel "${heading}" matches keywords`);
        targetPanels.push(panel);
      }
    });

    if (targetPanels.length > 0) {
      console.log(`Found ${targetPanels.length} matching panel(s)`);

      targetPanels.forEach((panel, panelIndex) => {
        const $panel = $(panel);
        const panelTitle = $panel.find('.x_title h2').text().trim();
        console.log(`\n=== Processing Panel: "${panelTitle}" ===`);

        // Find tables in this specific panel
        const tables = $panel.find('table');
        console.log(`Panel has ${tables.length} table(s)`);

        tables.each((tableIndex, table) => {
          const $table = $(table);
          console.log(`\nProcessing table ${tableIndex + 1} in "${panelTitle}" panel`);

          // Check if this table has the expected programme structure
          const headerRow = $table.find('thead tr').first();
          if (headerRow.length === 0) {
            console.log('No thead found, skipping table');
            return;
          }

          const headers = headerRow.find('th').map((i, th) => $(th).text().trim()).get();
          console.log(`Table headers: ${headers.join(' | ')}`);

          // Verify this looks like the programme table structure based on type
          let hasCorrectStructure = false;

          if (type === 'faculty_development') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('title')) &&
                                headers.some(h => h.toLowerCase().includes('organiser')) &&
                                headers.some(h => h.toLowerCase().includes('venue')) &&
                                headers.some(h => h.toLowerCase().includes('duration'));
          } else if (type === 'executive_development') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('programme')) &&
                                headers.some(h => h.toLowerCase().includes('participants')) &&
                                headers.some(h => h.toLowerCase().includes('venue')) &&
                                headers.some(h => h.toLowerCase().includes('revenue'));
          } else if (type === 'special_programmes') {
            hasCorrectStructure = headers.includes('S.No') &&
                                (headers.some(h => h.toLowerCase().includes('impress')) ||
                                 headers.some(h => h.toLowerCase().includes('imprint')) ||
                                 headers.some(h => h.toLowerCase().includes('sparc')) ||
                                 headers.some(h => h.toLowerCase().includes('stars')) ||
                                 headers.some(h => h.toLowerCase().includes('leap'))) &&
                                headers.some(h => h.toLowerCase().includes('place'));
          } else if (type === 'arpit_programmes') {
            hasCorrectStructure = headers.includes('S.No') &&
                                headers.some(h => h.toLowerCase().includes('programme')) &&
                                headers.some(h => h.toLowerCase().includes('period'));
          }

          if (hasCorrectStructure) {
            console.log(`✓ Table has correct ${type} structure - extracting data`);
            this.parseProgrammeTable($, $table, items, type);
          } else {
            console.log(`✗ Table doesn't match expected ${type} structure`);
          }
        });
      });
    } else {
      console.log(`No panels found, falling back to table-based search`);

      // Fallback: search all tables in the tab
      const tables = programmeTab.find('table');
      tables.each((tableIndex, table) => {
        const $table = $(table);

        // Quick check if this looks like a programme table
        const headers = $table.find('th').map((i, th) => $(th).text().trim()).get();
        const hasProgrammeStructure = headers.includes('S.No') &&
                                    (headers.some(h => h.toLowerCase().includes('programme')) ||
                                     headers.some(h => h.toLowerCase().includes('title')) ||
                                     headers.some(h => h.toLowerCase().includes('fdp')));

        if (hasProgrammeStructure) {
          console.log(`Found programme table (fallback) - extracting data`);
          this.parseProgrammeTable($, $table, items, type);
        }
      });
    }

    console.log(`Total ${type} items extracted: ${items.length}`);
    return items;
  }

  // Parse programme table based on type
  parseProgrammeTable($, $table, items, type) {
    console.log(`Parsing ${type} programme table`);

    const rows = $table.find('tr');
    if (rows.length < 2) return; // Need at least header + 1 data row

    // Skip header row and process data rows
    rows.slice(1).each((rowIndex, row) => {
      const $row = $(row);

      // Handle both <th scope="row"> and <td> for S.No
      const snoCell = $row.find('th[scope="row"]');
      const dataCells = $row.find('td');

      let item = {};

      if (type === 'faculty_development') {
        // Faculty Development: S.No | Title of the FDP | Organiser | Venue | Duration | From Date | To Date | Year
        if (snoCell.length > 0 && dataCells.length >= 7) {
          item = {
            sno: snoCell.text().trim(),
            title: $(dataCells[0]).text().trim(),
            organiser: $(dataCells[1]).text().trim(),
            venue: $(dataCells[2]).text().trim(),
            duration: $(dataCells[3]).text().trim(),
            fromDate: $(dataCells[4]).text().trim(),
            toDate: $(dataCells[5]).text().trim(),
            year: $(dataCells[6]).text().trim()
          };
          console.log(`Found faculty development: ${item.title} (${item.year})`);
        } else if (dataCells.length >= 8) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            title: $(dataCells[1]).text().trim(),
            organiser: $(dataCells[2]).text().trim(),
            venue: $(dataCells[3]).text().trim(),
            duration: $(dataCells[4]).text().trim(),
            fromDate: $(dataCells[5]).text().trim(),
            toDate: $(dataCells[6]).text().trim(),
            year: $(dataCells[7]).text().trim()
          };
          console.log(`Found faculty development (alt): ${item.title} (${item.year})`);
        }
      } else if (type === 'executive_development') {
        // Executive Development: S.No | Name of the Programme | No. of Participants | Venue | Duration | From Date | To Date | Year | Revenue Generated
        if (snoCell.length > 0 && dataCells.length >= 8) {
          item = {
            sno: snoCell.text().trim(),
            programName: $(dataCells[0]).text().trim(),
            participants: $(dataCells[1]).text().trim(),
            venue: $(dataCells[2]).text().trim(),
            duration: $(dataCells[3]).text().trim(),
            fromDate: $(dataCells[4]).text().trim(),
            toDate: $(dataCells[5]).text().trim(),
            year: $(dataCells[6]).text().trim(),
            revenue: $(dataCells[7]).text().trim()
          };
          console.log(`Found executive development: ${item.programName} (${item.year})`);
        } else if (dataCells.length >= 9) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            programName: $(dataCells[1]).text().trim(),
            participants: $(dataCells[2]).text().trim(),
            venue: $(dataCells[3]).text().trim(),
            duration: $(dataCells[4]).text().trim(),
            fromDate: $(dataCells[5]).text().trim(),
            toDate: $(dataCells[6]).text().trim(),
            year: $(dataCells[7]).text().trim(),
            revenue: $(dataCells[8]).text().trim()
          };
          console.log(`Found executive development (alt): ${item.programName} (${item.year})`);
        }
      } else if (type === 'special_programmes') {
        // Special Programmes: S.No | IMPRESS/IMPRINT/SPARC/STARS/LEAP/Others | Place | From Date | To Date | Year
        if (snoCell.length > 0 && dataCells.length >= 5) {
          item = {
            sno: snoCell.text().trim(),
            programType: $(dataCells[0]).text().trim(),
            place: $(dataCells[1]).text().trim(),
            fromDate: $(dataCells[2]).text().trim(),
            toDate: $(dataCells[3]).text().trim(),
            year: $(dataCells[4]).text().trim()
          };
          console.log(`Found special programme: ${item.programType} (${item.year})`);
        } else if (dataCells.length >= 6) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            programType: $(dataCells[1]).text().trim(),
            place: $(dataCells[2]).text().trim(),
            fromDate: $(dataCells[3]).text().trim(),
            toDate: $(dataCells[4]).text().trim(),
            year: $(dataCells[5]).text().trim()
          };
          console.log(`Found special programme (alt): ${item.programType} (${item.year})`);
        }
      } else if (type === 'arpit_programmes') {
        // ARPIT Programmes: S.No | Name of the Programme | Period of the Programme (From Date | To Date)
        if (snoCell.length > 0 && dataCells.length >= 3) {
          item = {
            sno: snoCell.text().trim(),
            programName: $(dataCells[0]).text().trim(),
            fromDate: $(dataCells[1]).text().trim(),
            toDate: $(dataCells[2]).text().trim()
          };
          console.log(`Found ARPIT programme: ${item.programName}`);
        } else if (dataCells.length >= 4) {
          item = {
            sno: $(dataCells[0]).text().trim(),
            programName: $(dataCells[1]).text().trim(),
            fromDate: $(dataCells[2]).text().trim(),
            toDate: $(dataCells[3]).text().trim()
          };
          console.log(`Found ARPIT programme (alt): ${item.programName}`);
        }
      }

      // Only add if we have actual content
      if (item.sno && Object.keys(item).length > 1) {
        // Check if this is not just headers
        const isHeader = (type === 'faculty_development' && item.title === 'Title of the FDP') ||
                        (type === 'executive_development' && item.programName === 'Name of the Programme') ||
                        (type === 'special_programmes' && item.programType === 'IMPRESS/IMPRINT/SPARC/STARS/LEAP/Others') ||
                        (type === 'arpit_programmes' && item.programName === 'Name of the Programme');

        if (!isHeader) {
          items.push(item);
          console.log(`✅ Successfully added ${type} item: S.No ${item.sno}`);
        } else {
          console.log(`⚠️ Skipped header row`);
        }
      } else {
        console.log(`⚠️ Row ${rowIndex + 1} doesn't have sufficient data or structure`);
      }
    });
  }

  // Programme Section Methods - Enhanced for structured table extraction
  extractFacultyDevelopment($) {
    console.log('Starting Faculty Development Programme extraction...');
    return this.extractProgrammeTable($, [
      'Faculty Development Programme Attended (Orientation, Refresher, other Short Term Course during the year)',
      'Faculty Development Programme',
      'FDP Attended',
      'Professional Development'
    ], 'faculty_development');
  }

  extractExecutiveDevelopment($) {
    console.log('Starting Executive Development Programme extraction...');
    return this.extractProgrammeTable($, [
      'Details of Executive Development Prog/Management Development Prog. conducted',
      'Executive Development Prog',
      'Management Development Prog',
      'Executive Development',
      'Management Development'
    ], 'executive_development');
  }

  extractSpecialProgrammes($) {
    console.log('Starting Special Programmes extraction...');
    return this.extractProgrammeTable($, [
      'Participation in IMPESS, IMPRINT, SPARC, STARS, LEAP Programme etc and DSF Funding Programme',
      'IMPESS, IMPRINT, SPARC, STARS, LEAP',
      'Special Programmes',
      'Government Programmes',
      'IMPESS',
      'IMPRINT',
      'SPARC',
      'STARS',
      'LEAP'
    ], 'special_programmes');
  }

  extractArpitProgrammes($) {
    console.log('Starting ARPIT Programme extraction...');
    return this.extractProgrammeTable($, [
      'Enrolment under ARPIT Programme',
      'ARPIT Programme',
      'ARPIT Enrolment'
    ], 'arpit_programmes');
  }

  /**
   * Generic method to extract data from sections based on headings
   */
  extractSectionData($, headings) {
    const data = [];

    for (const heading of headings) {
      // Find H2 headings that match our target
      $('h2').each((index, element) => {
        const headingText = $(element).text().trim();
        if (headingText.toLowerCase().includes(heading.toLowerCase())) {
          console.log(`Found section: ${headingText}`);

          // Look for the next table after this heading
          let nextElement = $(element).next();
          while (nextElement.length && !nextElement.is('table') && !nextElement.is('h2')) {
            if (nextElement.find('table').length > 0) {
              nextElement = nextElement.find('table').first();
              break;
            }
            nextElement = nextElement.next();
          }

          if (nextElement.is('table')) {
            // Extract table data
            const tableData = this.extractTableData($, nextElement);
            data.push(...tableData);
          } else {
            // Extract text content
            const textData = this.extractTextAfterHeading($, $(element));
            data.push(...textData);
          }
        }
      });
    }

    return data;
  }

  /**
   * Extract structured data from tables
   */
  extractTableData($, table) {
    const data = [];

    $(table).find('tr').slice(1).each((rowIndex, row) => {
      const cells = [];
      $(row).find('td').each((cellIndex, cell) => {
        const cellText = $(cell).text().trim();
        if (cellText) {
          cells.push(cellText);
        }
      });

      if (cells.length > 0) {
        // Join cells with ' - ' to create a readable entry
        data.push(cells.join(' - '));
      }
    });

    return data;
  }

  /**
   * Extract text content after a heading
   */
  extractTextAfterHeading($, headingElement) {
    const data = [];
    let currentElement = headingElement.next();

    // Look at the next several elements after the heading
    for (let i = 0; i < 5 && currentElement.length; i++) {
      // Stop if we hit another H2 heading
      if (currentElement.is('h2')) {
        break;
      }

      const text = currentElement.text().trim();
      if (text && text.length > 10) {
        // Split by common delimiters and clean up
        const items = text.split(/\n|\r/).map(item => item.trim()).filter(item => item.length > 5);
        data.push(...items);
      }

      currentElement = currentElement.next();
    }

    return data;
  }

  /**
   * Find heading element by text content
   */
  findHeadingElement($, headingText) {
    const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', '.heading', '.section-title'];

    for (const selector of selectors) {
      const elements = $(selector);
      for (let i = 0; i < elements.length; i++) {
        const element = $(elements[i]);
        if (element.text().trim().toLowerCase().includes(headingText.toLowerCase())) {
          return element;
        }
      }
    }

    return $();
  }

  /**
   * Extract data that appears after a heading
   */
  extractDataAfterHeading($, headingElement) {
    const data = [];
    let currentElement = headingElement.next();

    // Look at the next several elements after the heading
    for (let i = 0; i < 10 && currentElement.length; i++) {
      const text = currentElement.text().trim();

      // Stop if we hit another heading
      if (this.isHeadingElement(currentElement)) {
        break;
      }

      // Add non-empty text content
      if (text && text.length > 3) {
        // Split by common delimiters and clean up
        const items = text.split(/\n|\r|\•|•|→|▪/).map(item => item.trim()).filter(item => item.length > 3);
        data.push(...items);
      }

      // Also check for list items
      currentElement.find('li').each((index, li) => {
        const liText = $(li).text().trim();
        if (liText && liText.length > 3) {
          data.push(liText);
        }
      });

      // Check for table rows
      currentElement.find('tr').each((index, tr) => {
        if (index > 0) { // Skip header row
          const cells = $(tr).find('td');
          if (cells.length > 0) {
            const rowData = [];
            cells.each((cellIndex, cell) => {
              const cellText = $(cell).text().trim();
              if (cellText) {
                rowData.push(cellText);
              }
            });
            if (rowData.length > 0) {
              data.push(rowData.join(' - '));
            }
          }
        }
      });

      currentElement = currentElement.next();
    }

    return data;
  }

  /**
   * Check if an element is a heading
   */
  isHeadingElement(element) {
    const tagName = element.prop('tagName');
    return tagName && /^H[1-6]$/.test(tagName.toUpperCase());
  }

  /**
   * Scrape multiple faculty members
   * @param {Array} nodeIds - Array of faculty node IDs
   * @returns {Array} Array of scraped faculty data
   */
  async scrapeMultipleFaculty(nodeIds) {
    const results = [];
    const errors = [];

    for (const nodeId of nodeIds) {
      try {
        const facultyData = await this.scrapeFacultyData(nodeId);
        results.push(facultyData);

        // Add delay to avoid overwhelming the server
        await this.delay(1000);

      } catch (error) {
        errors.push({ nodeId, error: error.message });
        console.error(`Failed to scrape node ${nodeId}:`, error.message);
      }
    }

    return {
      success: results,
      errors: errors,
      totalProcessed: nodeIds.length,
      successCount: results.length,
      errorCount: errors.length
    };
  }

  /**
   * Utility function to add delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Discover faculty node IDs by scraping the faculty directory
   * @returns {Array} Array of discovered node IDs
   */
  async discoverFacultyNodes() {
    try {
      // This would need to be implemented based on how faculty are listed
      // on the university website. You might need to scrape a faculty directory page
      console.log('Faculty node discovery would need to be implemented based on the university\'s faculty directory structure');
      return [];
    } catch (error) {
      console.error('Error discovering faculty nodes:', error);
      return [];
    }
  }
}

module.exports = FacultyDataScraper;