# Faculty Import Logic - Code Examples & Implementation Guide

## Table of Contents
1. Frontend Implementation
2. Backend Implementation
3. API Request Examples
4. Data Extraction Examples
5. Testing Guide

---

## 1. Frontend Implementation

### FacultyImporter Component Structure

```javascript
// File: frontend/src/components/FacultyImporter.js

import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { getApiUrl } from '../config/api';

const FacultyImporter = () => {
  // State management
  const [nodeId, setNodeId] = useState('');           // Faculty node ID
  const [loading, setLoading] = useState(false);      // Loading state
  const [result, setResult] = useState(null);         // Import result
  const [backendStatus, setBackendStatus] = useState('checking'); // Backend connection

  // Check backend availability
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(getApiUrl('/'));
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };
    checkBackendStatus();
  }, []);

  // Handle import request
  const handleSingleImport = async () => {
    if (!nodeId) return;

    setLoading(true);
    setResult(null);

    try {
      const apiUrl = getApiUrl('/api/scraper/faculty');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          nodeId,
          data: data.data
        });
      } else {
        setResult({
          success: false,
          nodeId,
          error: data.message || 'Failed to import faculty data'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        nodeId,
        error: 'Network error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Render input section
  return (
    <Layout>
      <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
        {/* Input Section */}
        <div>
          <input
            type="text"
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
            placeholder="Enter Faculty Node ID (e.g., 941)"
            style={{
              padding: '18px 24px',
              border: '2px solid #e9ecef',
              borderRadius: '12px',
              fontSize: '16px',
              width: '320px',
            }}
          />
          <button
            onClick={handleSingleImport}
            disabled={loading || !nodeId}
            style={{
              padding: '18px 36px',
              backgroundColor: loading || !nodeId ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: loading || !nodeId ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Importing...' : 'Import Faculty'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div style={{
            padding: '20px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            borderRadius: '12px',
            marginTop: '20px'
          }}>
            <h4>{result.success ? '✓ Import Successful' : '✗ Import Failed'}</h4>
            {result.success ? (
              <>
                <h5>🎓 Education Details</h5>
                <table>
                  <thead>
                    <tr>
                      <th>Degree</th>
                      <th>Title</th>
                      <th>University</th>
                      <th>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.home.education.map((edu, idx) => (
                      <tr key={idx}>
                        <td>{edu.degree}</td>
                        <td>{edu.title}</td>
                        <td>{edu.university}</td>
                        <td>{edu.graduationYear}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p>Error: {result.error}</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FacultyImporter;
```

---

## 2. Backend Implementation

### API Endpoint

```javascript
// File: Backend/index.js (lines 70-116)

// Public Faculty Data Scraper route (no authentication required)
app.post('/api/scraper/faculty', async (req, res) => {
    try {
        const { nodeId } = req.body;

        // Validate input
        if (!nodeId) {
            return res.status(400).json({
                success: false,
                message: 'Node ID is required'
            });
        }

        // Load scraper
        let scraper = null;
        try {
            const FacultyDataScraper = require('./scrapers/facultyDataScraper');
            scraper = new FacultyDataScraper();
        } catch (error) {
            console.error('Error loading FacultyDataScraper:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Faculty data scraper not available',
                error: error.message
            });
        }

        // Scrape data
        const scrapedData = await scraper.scrapeFacultyData(nodeId);

        // Validate result
        if (!scrapedData.name) {
            return res.status(404).json({
                success: false,
                message: 'No faculty data found for the provided Node ID'
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Faculty data scraped successfully',
            data: scrapedData
        });

    } catch (error) {
        console.error('Faculty scraper error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to scrape faculty data',
            error: error.message
        });
    }
});
```

### Scraper Class

```javascript
// File: Backend/scrapers/facultyDataScraper.js (simplified)

const axios = require('axios');
const cheerio = require('cheerio');

class FacultyDataScraper {
  constructor() {
    this.baseUrl = 'https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node=';
  }

  /**
   * Main scraping method
   */
  async scrapeFacultyData(nodeId) {
    try {
      console.log(`Scraping data for faculty node: ${nodeId}`);

      const url = `${this.baseUrl}${nodeId}`;
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      const facultyData = {
        // Basic info
        name: this.extractName($),
        department: this.extractDepartment($),
        school: this.extractSchool($),
        email: this.extractEmail($),
        profileImage: this.extractProfileImage($, nodeId),

        // Sections
        home: {
          education: this.extractEducation($),
          specialization: this.extractSpecialization($),
          awards: this.extractAwards($),
          researchInterests: this.extractResearchInterests($)
        },

        experience: {
          teaching: this.extractTeachingExperience($),
          research: this.extractResearchExperience($),
          industry: this.extractIndustryExperience($)
        },

        research_guidance: {
          pg_guidance: this.extractPGGuidance($),
          phd_guidance: this.extractPhDGuidance($),
          postdoc_guidance: this.extractPostDocGuidance($)
        },

        // Meta
        scraped_date: new Date(),
        source_url: url,
        node_id: nodeId
      };

      console.log(`Successfully scraped data for ${facultyData.name}`);
      return facultyData;

    } catch (error) {
      console.error(`Error scraping faculty data for node ${nodeId}:`, error.message);
      throw new Error(`Failed to scrape faculty data: ${error.message}`);
    }
  }
}

module.exports = FacultyDataScraper;
```

---

## 3. API Request Examples

### Using curl

```bash
# Basic request
curl -X POST http://localhost:5000/api/scraper/faculty \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"941"}'

# With verbose output
curl -v -X POST http://localhost:5000/api/scraper/faculty \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"941"}'

# Save response to file
curl -X POST http://localhost:5000/api/scraper/faculty \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"941"}' \
  -o response.json
```

### Using JavaScript/Fetch

```javascript
// Simple request
fetch('/api/scraper/faculty', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ nodeId: '941' })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// With error handling
async function importFaculty(nodeId) {
  try {
    const response = await fetch('/api/scraper/faculty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('Faculty:', data.data.name);
      console.log('Department:', data.data.department);
      console.log('Education:', data.data.home.education);
    } else {
      console.error('Error:', data.message);
    }

    return data;
  } catch (error) {
    console.error('Failed to import:', error.message);
  }
}

// Usage
importFaculty('941');
```

### Using axios (Node.js)

```javascript
const axios = require('axios');

// Request
axios.post('http://localhost:5000/api/scraper/faculty', {
  nodeId: '941'
})
.then(response => {
  console.log('Success:', response.data);
})
.catch(error => {
  console.error('Error:', error.message);
});

// With async/await
async function scrapeFaculty(nodeId) {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/scraper/faculty',
      { nodeId }
    );
    return response.data;
  } catch (error) {
    console.error('Scraping failed:', error.message);
  }
}
```

---

## 4. Data Extraction Examples

### Extract Name

```javascript
/**
 * Extract faculty name from the page
 */
extractName($) {
  // Try multiple selectors
  const selectors = ['h2', 'h1', '.faculty-name', '.name', '.profile-name'];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length && element.text().trim()) {
      return element.text().trim();
    }
  }

  return '';
}
```

### Extract Education

```javascript
/**
 * Extract educational qualifications
 */
extractEducation($) {
  const education = [];

  // Find education tab
  const educationTab = $('#tab_content1');
  if (educationTab.length) {
    // Find education tables
    educationTab.find('table').each((tableIndex, table) => {
      const headers = $(table).find('th')
        .map((i, th) => $(th).text().toLowerCase().trim())
        .get();

      // Check if education table
      const isEducationTable = headers.some(h =>
        h.includes('degree') ||
        h.includes('university') ||
        h.includes('college')
      );

      if (isEducationTable) {
        // Extract rows
        $(table).find('tr').slice(1).each((rowIndex, row) => {
          const cells = $(row).find('td');

          if (cells.length >= 3) {
            let degree = '', title = '', university = '', year = '';

            if (cells.length >= 4) {
              const firstCol = $(cells[0]).text().trim();
              if (isNaN(firstCol)) {
                degree = $(cells[0]).text().trim();
                title = $(cells[1]).text().trim();
                university = $(cells[2]).text().trim();
                year = $(cells[3]).text().trim();
              } else {
                degree = $(cells[1]).text().trim();
                title = $(cells[2]).text().trim();
                university = $(cells[3]).text().trim();
                year = cells.length > 4 ? $(cells[4]).text().trim() : '';
              }
            }

            // Validate
            if (degree && university && this.isValidDegree(degree)) {
              education.push({
                degree,
                title: title || '',
                university,
                graduationYear: year || ''
              });
            }
          }
        });
      }
    });
  }

  return education;
}

isValidDegree(degree) {
  const validKeywords = ['phd', 'm.', 'b.', 'master', 'bachelor', 'diploma'];
  return validKeywords.some(kw => degree.toLowerCase().includes(kw));
}
```

### Extract PhD Guidance

```javascript
/**
 * Extract PhD research guidance data
 */
extractPhDGuidance($) {
  const phdGuidance = [];

  // Find PhD guidance section
  const phdTab = $('a:contains("PhD Guidance")').parent();
  const phdContent = phdTab.next();

  if (phdContent.length) {
    phdContent.find('table').each((tableIndex, table) => {
      $(table).find('tr').slice(1).each((rowIndex, row) => {
        const cells = $(row).find('td');

        if (cells.length >= 4) {
          phdGuidance.push({
            studentName: $(cells[0]).text().trim(),
            registrationNo: $(cells[1]).text().trim(),
            registrationDate: $(cells[2]).text().trim(),
            thesisTitle: $(cells[3]).text().trim(),
            status: cells.length > 4 ? $(cells[4]).text().trim() : 'NO'
          });
        }
      });
    });
  }

  return phdGuidance;
}
```

### Extract Teaching Experience

```javascript
/**
 * Extract teaching experience
 */
extractTeachingExperience($) {
  const teachingExp = [];

  // Find experience section
  const experienceTab = $('#tab_content4'); // Adjust selector as needed

  if (experienceTab.length) {
    experienceTab.find('table').each((tableIndex, table) => {
      $(table).find('tr').slice(1).each((rowIndex, row) => {
        const cells = $(row).find('td');

        if (cells.length >= 3) {
          teachingExp.push({
            designation: $(cells[0]).text().trim(),
            department: $(cells[1]).text().trim(),
            institution: $(cells[2]).text().trim(),
            duration: cells.length > 3 ? $(cells[3]).text().trim() : ''
          });
        }
      });
    });
  }

  return teachingExp;
}
```

---

## 5. Testing Guide

### Test Script

```javascript
// File: Backend/test-import.js

const axios = require('axios');

async function testFacultyImport() {
  const testNodeIds = ['941', '123', '456'];

  for (const nodeId of testNodeIds) {
    console.log(`\nTesting Node ID: ${nodeId}`);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/scraper/faculty',
        { nodeId },
        { timeout: 30000 }
      );

      if (response.data.success) {
        const data = response.data.data;
        console.log(`✓ Success: ${data.name}`);
        console.log(`  Department: ${data.department}`);
        console.log(`  Education: ${data.home.education.length} entries`);
        console.log(`  Awards: ${data.home.awards.length} entries`);
        console.log(`  PhD Guidance: ${data.research_guidance.phd_guidance.length} entries`);
      } else {
        console.log(`✗ Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
    }
  }
}

testFacultyImport();
```

### Manual Testing Steps

1. **Start Backend**
   ```bash
   cd Backend
   npm start
   ```

2. **Open Frontend**
   ```bash
   cd frontend
   npm start
   ```

3. **Navigate to Faculty Importer**
   - Go to `/faculty-importer` route

4. **Test Import**
   - Enter Node ID: `941`
   - Click "Import Faculty"
   - View results

5. **Verify Data**
   - Check Education table populated
   - Check Teaching Experience table populated
   - Check Awards table populated
   - Check PhD Guidance table populated

---

## Response Examples

### Success Response

```json
{
  "success": true,
  "message": "Faculty data scraped successfully",
  "data": {
    "name": "Dr. John Doe",
    "department": "Department of Computer Science",
    "school": "School of Science",
    "email": "john.doe@pondiuni.edu.in",
    "profileImage": "https://backup.pondiuni.edu.in/...",
    "home": {
      "education": [
        {
          "degree": "PhD",
          "title": "Advanced Computing",
          "university": "IIT Madras",
          "graduationYear": "2015"
        }
      ],
      "specialization": ["AI/ML", "Data Science"],
      "awards": [
        {
          "title": "Best Research Award",
          "type": "Research",
          "agency": "Ministry of Science",
          "year": "2020",
          "amount": "$5000"
        }
      ],
      "researchInterests": ["Machine Learning", "NLP"]
    },
    "experience": {
      "teaching": [
        {
          "designation": "Associate Professor",
          "department": "Computer Science",
          "institution": "Pondicherry University",
          "duration": "2015-Present"
        }
      ],
      "research": [],
      "industry": []
    },
    "research_guidance": {
      "phd_guidance": [
        {
          "studentName": "Ramesh Kumar",
          "registrationNo": "PhD-001",
          "registrationDate": "2018-06-15",
          "thesisTitle": "Deep Learning Applications",
          "status": "YES"
        }
      ],
      "pg_guidance": [],
      "postdoc_guidance": []
    },
    "scraped_date": "2025-11-09T10:30:00Z",
    "source_url": "https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node=941",
    "node_id": "941"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Node ID is required"
}
```

---

## Debugging Tips

### Enable Verbose Logging

```javascript
// In FacultyDataScraper.js
async scrapeFacultyData(nodeId) {
  console.log('Starting scrape for nodeId:', nodeId);

  const url = `${this.baseUrl}${nodeId}`;
  console.log('URL:', url);

  const response = await axios.get(url, { ... });
  console.log('Response status:', response.status);
  console.log('Response size:', response.data.length);

  const $ = cheerio.load(response.data);
  console.log('Parsed HTML');

  // ... extraction methods
}
```

### Check Network Requests

```javascript
// Browser DevTools -> Network tab
// Filter: XHR
// Look for POST /api/scraper/faculty
// Check:
//   - Request headers
//   - Request body
//   - Response headers
//   - Response body
```

### Test Individual Extraction Methods

```javascript
const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const cheerio = require('cheerio');

const html = `<h1>Dr. John Doe</h1>`;
const $ = cheerio.load(html);

const scraper = new FacultyDataScraper();
const name = scraper.extractName($);
console.log('Extracted name:', name);
```

---

**Last Updated**: November 9, 2025
**Status**: ✅ Complete Implementation Guide
