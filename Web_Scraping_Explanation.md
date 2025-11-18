# Web Scraping System in Professor Publication Platform

## Overview

The Professor Publication platform includes a sophisticated web scraping system designed to automatically extract faculty data from Pondicherry University's official website. This system allows administrators to import comprehensive faculty profiles without manual data entry.

## System Architecture

### 1. Core Components

#### A. FacultyDataScraper (`facultyDataScraper.js`)
The main scraping engine that extracts detailed faculty information from university profile pages.

**Location**: `Backend/scrapers/facultyDataScraper.js`

**Key Features**:
- Extracts comprehensive faculty profiles from university website
- Handles multiple data sections (education, experience, publications, awards, etc.)
- Built-in error handling and retry mechanisms
- Structured data output matching database schema

#### B. FacultyNodeDiscovery (`facultyNodeDiscovery.js`)
A utility service for discovering faculty profile URLs and node IDs from department pages.

**Location**: `Backend/utils/facultyNodeDiscovery.js`

**Key Features**:
- Department-wise faculty discovery
- Automatic node ID extraction
- Bulk faculty profile identification
- Search and discovery tools

#### C. Scraper API Routes (`scraperRoutes.js`)
RESTful API endpoints that expose scraping functionality to the frontend.

**Location**: `Backend/routes/scraperRoutes.js`

**Key Features**:
- Single faculty import
- Batch faculty processing
- Preview functionality
- Error handling and validation

## Technical Implementation

### 2. Technologies Used

#### Primary Libraries:
- **Puppeteer**: Headless browser automation for dynamic content
- **Cheerio**: Server-side jQuery implementation for HTML parsing
- **Axios**: HTTP client for making requests to university website

#### Supporting Technologies:
- **Express.js**: API route handling
- **MongoDB**: Data storage via Mongoose ODM
- **JWT**: Authentication for admin-only access

### 3. Data Extraction Process

#### Step 1: URL Construction
```javascript
const url = `${this.baseUrl}${nodeId}`;
// Example: https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node=1001
```

#### Step 2: HTTP Request with Headers
```javascript
const response = await axios.get(url, {
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});
```

#### Step 3: HTML Parsing with Cheerio
```javascript
const $ = cheerio.load(response.data);
```

#### Step 4: Data Extraction Using CSS Selectors
The scraper extracts data from various sections:

**Basic Information**:
- Name: Multiple selector fallbacks (`h2`, `h1`, `.faculty-name`)
- Department: Regex pattern matching
- Email: Email pattern extraction
- Profile Image: Image URL construction

**Academic Data**:
- Education qualifications
- Research specialization
- Awards and recognitions
- Teaching experience

**Professional Information**:
- Research guidance (PhD, PG, Post-doc)
- Publications and patents
- Books and chapters
- Conference participation

### 4. Data Structure

#### Extracted Faculty Object Structure:
```javascript
{
  // Basic Information
  name: string,
  department: string,
  school: string,
  email: string,
  profileImage: string,

  // Home Section
  home: {
    education: array,
    specialization: string,
    awards: array,
    researchInterests: array
  },

  // Experience Section
  experience: {
    teaching: array,
    research: array,
    industry: array
  },

  // Innovation Section
  innovation: {
    contributions: array,
    patents: array,
    ugc_papers: array,
    non_ugc_papers: array
  },

  // Books Section
  books: {
    authored_books: array,
    book_chapters: array,
    edited_books: array
  },

  // Projects/Consultancy
  projects_consultancy: {
    ongoing_projects: array,
    ongoing_consultancy: array,
    completed_projects: array,
    completed_consultancy: array
  },

  // Research Guidance
  research_guidance: {
    pg_guidance: array,
    phd_guidance: array,
    postdoc_guidance: array
  },

  // Conferences/Seminars
  conferences_seminars: {
    e_lectures: array,
    online_education: array,
    invited_talks: array,
    organized_conferences: array,
    organized_workshops: array
  },

  // Collaboration
  collaboration: {
    participation_extension: array,
    institutional_collaboration: array
  },

  // Programmes
  programmes: {
    faculty_development: array,
    executive_development: array,
    special_programmes: array
  },

  // Metadata
  scraped_date: Date,
  source_url: string,
  node_id: string
}
```

## API Endpoints

### 5. Available Scraping Endpoints

#### A. Test Endpoint
**GET** `/api/scraper/test`
- **Purpose**: Verify scraper service is working
- **Authentication**: Not required
- **Response**: Service status and timestamp

#### B. Single Faculty Import
**POST** `/api/scraper/faculty/:nodeId`
- **Purpose**: Import single faculty member
- **Authentication**: Admin required
- **Parameters**:
  - `nodeId`: Faculty node ID from university website
  - `overwrite`: Boolean to update existing records

#### C. Batch Faculty Import
**POST** `/api/scraper/faculty/batch`
- **Purpose**: Import multiple faculty members
- **Authentication**: Admin required
- **Body**:
  ```json
  {
    "nodeIds": ["1001", "1002", "1003"],
    "overwrite": false
  }
  ```
- **Limits**: Maximum 50 faculty per batch

#### D. Preview Faculty Data
**GET** `/api/scraper/preview/:nodeId`
- **Purpose**: Preview scraped data without saving
- **Authentication**: Admin required
- **Response**: Complete scraped data structure

## Frontend Integration

### 6. Faculty Importer Component

**Location**: `frontend/src/components/FacultyImporter.js`

The frontend component provides:
- Faculty node ID input
- Import progress tracking
- Detailed data display tables
- Error handling and user feedback

#### Key Features:
- **Real-time Import**: Shows progress during scraping
- **Data Visualization**: Tables for education, experience, awards
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation of successful imports

#### Component Structure:
```javascript
const handleImportFaculty = async () => {
  try {
    setLoading(true);
    const response = await axios.post(`${API_BASE_URL}/api/scraper/faculty/${nodeId}`);
    setFacultyData(response.data.scrapedData);
    setMessage('Faculty data imported successfully!');
  } catch (error) {
    setError(error.response?.data?.message || 'Import failed');
  } finally {
    setLoading(false);
  }
};
```

## Data Processing Logic

### 7. Extraction Methods

#### A. Table-Based Extraction
Many data sections are extracted from HTML tables:

```javascript
extractEducation($) {
  const education = [];

  // Find education tables
  $('table').each((tableIndex, table) => {
    const headers = $(table).find('th').map((i, th) => $(th).text().toLowerCase().trim()).get();

    // Check if this is education table
    const isEducationTable = headers.some(h =>
      h.includes('degree') || h.includes('qualification') || h.includes('university')
    );

    if (isEducationTable) {
      $(table).find('tr').slice(1).each((rowIndex, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 3) {
          // Extract degree, university, year
          const degree = $(cells[0]).text().trim();
          const university = $(cells[1]).text().trim();
          const year = $(cells[2]).text().trim();

          if (degree && university) {
            education.push({ degree, university, year });
          }
        }
      });
    }
  });

  return education;
}
```

#### B. Pattern-Based Extraction
Text pattern matching for unstructured data:

```javascript
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
```

#### C. Selector-Based Extraction
CSS selector targeting for structured elements:

```javascript
extractName($) {
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

## Error Handling & Resilience

### 8. Error Management

#### A. Network Error Handling
```javascript
try {
  const response = await axios.get(url, {
    timeout: 15000,
    headers: { /* ... */ }
  });
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timeout - server may be slow');
  } else if (error.response?.status === 404) {
    throw new Error('Faculty profile not found');
  } else {
    throw new Error(`Network error: ${error.message}`);
  }
}
```

#### B. Data Validation
```javascript
if (!scrapedData.name) {
  return res.status(404).json({
    success: false,
    message: 'No faculty data found for the provided node ID.'
  });
}
```

#### C. Graceful Degradation
- Fallback selectors for different page layouts
- Optional field extraction (continues if some data is missing)
- Partial success handling in batch operations

## Security Considerations

### 9. Security Measures

#### A. Rate Limiting
- Built-in delays between requests (1-2 seconds)
- Batch processing limits (max 50 faculty)
- Timeout configurations

#### B. Authentication
- Admin-only access to scraping endpoints
- JWT token validation
- Role-based permissions

#### C. Data Sanitization
- Input validation for node IDs
- XSS prevention in data extraction
- SQL injection protection through Mongoose

#### D. Respectful Scraping
- User-Agent headers to identify requests
- Reasonable request intervals
- Error handling to avoid overwhelming target server

## Performance Optimization

### 10. Optimization Strategies

#### A. Efficient Parsing
- Single-pass HTML parsing with Cheerio
- Targeted CSS selectors
- Minimal DOM traversal

#### B. Memory Management
- Streaming data processing
- Garbage collection friendly code
- Resource cleanup after operations

#### C. Caching Strategy
- Database caching of scraped data
- Conditional updates (overwrite flag)
- Duplicate detection and prevention

## Maintenance & Monitoring

### 11. System Maintenance

#### A. Logging
```javascript
console.log(`Scraping data for faculty node: ${nodeId}`);
console.log(`Successfully scraped data for ${facultyData.name}`);
console.error(`Error scraping faculty data for node ${nodeId}:`, error.message);
```

#### B. Health Checks
- Test endpoint for service verification
- Preview functionality for validation
- Error tracking and reporting

#### C. Data Integrity
- Schema validation before database insertion
- Duplicate prevention mechanisms
- Data consistency checks

## Usage Examples

### 12. Common Use Cases

#### A. Import Single Faculty
```bash
curl -X POST "http://localhost:5000/api/scraper/faculty/1001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"overwrite": false}'
```

#### B. Batch Import
```bash
curl -X POST "http://localhost:5000/api/scraper/faculty/batch" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nodeIds": ["1001", "1002", "1003"],
    "overwrite": false
  }'
```

#### C. Preview Data
```bash
curl -X GET "http://localhost:5000/api/scraper/preview/1001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### 13. Common Issues & Solutions

#### A. Connection Timeouts
**Problem**: Requests timing out
**Solution**:
- Increase timeout values
- Check network connectivity
- Verify target website availability

#### B. Data Not Found
**Problem**: Empty or incomplete data extraction
**Solution**:
- Verify node ID validity
- Check if website structure changed
- Update CSS selectors if needed

#### C. Authentication Errors
**Problem**: 401/403 responses
**Solution**:
- Verify JWT token validity
- Check user role permissions
- Ensure proper authentication headers

#### D. Rate Limiting
**Problem**: Too many requests blocked
**Solution**:
- Increase delays between requests
- Reduce batch sizes
- Implement exponential backoff

## Future Enhancements

### 14. Potential Improvements

#### A. Enhanced Discovery
- Automatic department page discovery
- Intelligent node ID range detection
- Machine learning for pattern recognition

#### B. Advanced Parsing
- Natural language processing for research interests
- Image text extraction (OCR)
- PDF document parsing

#### C. Real-time Updates
- Scheduled scraping jobs
- Change detection mechanisms
- Automated data synchronization

#### D. Analytics
- Scraping success rate tracking
- Data quality metrics
- Performance monitoring dashboard

## Conclusion

The web scraping system in the Professor Publication platform provides a robust, scalable solution for automating faculty data import from the university website. It combines modern web technologies with careful error handling and security considerations to deliver reliable data extraction capabilities.

The system's modular design allows for easy maintenance and extension, while its comprehensive API ensures seamless integration with the frontend application. Through proper use of this system, administrators can efficiently populate the faculty database with rich, structured data from official university sources.