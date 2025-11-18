# Faculty Import Logic - Complete Documentation

## Overview
The faculty import system consists of two main components:
1. **Frontend Component** (`FacultyImporter.js`) - User interface for triggering imports
2. **Backend Scraper** (`facultyDataScraper.js`) - Web scraper that extracts faculty data
3. **API Endpoint** (`index.js`) - Express route that handles the scraping request

## Architecture Flow

```
Frontend (FacultyImporter.js)
    ↓
    User enters Faculty Node ID (e.g., 941)
    ↓
    Button: "Import Faculty"
    ↓
POST /api/scraper/faculty
    ↓
Backend API Endpoint (index.js)
    ↓
Initialize FacultyDataScraper
    ↓
Scrape from: https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node={nodeId}
    ↓
Extract data using Cheerio (HTML parsing)
    ↓
Return structured JSON with faculty profile data
    ↓
Display results in tables on Frontend
```

---

## 1. Frontend Component: `FacultyImporter.js`

### Location
`frontend/src/components/FacultyImporter.js`

### Key Functions

#### `handleSingleImport()`
```javascript
const handleSingleImport = async () => {
  // 1. Validates nodeId is not empty
  // 2. Sets loading state
  // 3. Makes POST request to /api/scraper/faculty
  // 4. Sends: { nodeId }
  // 5. Receives: Scraped faculty data
  // 6. Displays results in formatted tables
}
```

**Request Structure**:
```javascript
POST /api/scraper/faculty
Content-Type: application/json

{
  "nodeId": "941"  // Faculty node ID from Pondicherry University
}
```

**Response Structure**:
```javascript
{
  "success": true,
  "message": "Faculty data scraped successfully",
  "data": {
    // Complete faculty profile data (see below)
  }
}
```

### UI Components

#### Input Section
- **Input Field**: Text input for Faculty Node ID (e.g., "941")
- **Button**: "Import Faculty" button
- **States**:
  - Default: Button enabled
  - Loading: Button disabled, shows "Importing..."
  - Success/Error: Shows result message

#### Results Display (Tables)

1. **Education Details Table**
   - Columns: Degree, Title, University, Year
   - Data: `result.data.home.education`

2. **Teaching Experience Table**
   - Columns: Designation, Department, Institution, Duration/Notes
   - Data: `result.data.experience.teaching`

3. **PhD Research Guidance Table**
   - Columns: Student Name, Registration No, Registration Date, Thesis Title, Status
   - Data: `result.data.research_guidance.phd_guidance`

4. **Awards & Recognition Table**
   - Columns: Title, Type, Agency, Year, Amount
   - Data: `result.data.home.awards`

### Status Messages
- ✅ **Success**: Green background with faculty data tables
- ❌ **Error**: Red background with error message
- ⏳ **Loading**: Spinner animation while scraping

---

## 2. Backend API Endpoint: `Backend/index.js`

### Location
`Backend/index.js` - Lines 70-116

### Endpoint Details

```javascript
app.post('/api/scraper/faculty', async (req, res) => {
  // 1. Extract nodeId from request body
  // 2. Validate nodeId is provided
  // 3. Load FacultyDataScraper class
  // 4. Call scraper.scrapeFacultyData(nodeId)
  // 5. Check if data was scraped (name exists)
  // 6. Return scraped data in JSON format
  // 7. Handle errors gracefully
})
```

### Authentication
- **Required**: ❌ No (public route)
- **Why**: Allows public access to university faculty data

### Error Handling
- **400**: Missing or invalid nodeId
- **404**: Faculty data not found
- **500**: Scraper not available or scraping failed

---

## 3. Scraper Logic: `Backend/scrapers/facultyDataScraper.js`

### Location
`Backend/scrapers/facultyDataScraper.js` (971 lines)

### Base URL
```javascript
baseUrl = 'https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node='
```

### Main Method: `scrapeFacultyData(nodeId)`

```javascript
async scrapeFacultyData(nodeId) {
  // 1. Construct URL: baseUrl + nodeId
  // 2. Fetch HTML using axios
  // 3. Parse HTML with cheerio
  // 4. Extract data using specialized methods
  // 5. Return structured faculty object
}
```

### Data Extraction Methods

The scraper extracts data into the following structure:

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
    education: [{ degree, title, university, graduationYear }],
    specialization: [string],
    awards: [{ title, type, agency, year, amount }],
    researchInterests: [string]
  },

  // Experience Section
  experience: {
    teaching: [{ designation, department, institution, duration }],
    research: [{ ... }],
    industry: [{ ... }]
  },

  // Innovation Section
  innovation: {
    contributions: [{ ... }],
    patents: [{ ... }],
    ugc_papers: [{ ... }],
    non_ugc_papers: [{ ... }]
  },

  // Books Section
  books: {
    authored_books: [{ ... }],
    book_chapters: [{ ... }],
    edited_books: [{ ... }]
  },

  // Projects/Consultancy Section
  projects_consultancy: {
    ongoing_projects: [{ ... }],
    completed_projects: [{ ... }],
    ongoing_consultancy: [{ ... }],
    completed_consultancy: [{ ... }]
  },

  // Research Guidance Section
  research_guidance: {
    pg_guidance: [{ ... }],
    phd_guidance: [{ studentName, registrationNo, registrationDate, thesisTitle, status }],
    postdoc_guidance: [{ ... }]
  },

  // Conference/Seminars Section
  conferences_seminars: {
    e_lectures: [{ ... }],
    online_education: [{ ... }],
    invited_talks: [{ ... }],
    organized_conferences: [{ ... }],
    organized_workshops: [{ ... }]
  },

  // Collaboration Section
  collaboration: {
    participation_extension: [{ ... }],
    institutional_collaboration: [{ ... }]
  },

  // Programmes Section
  programmes: {
    faculty_development: [{ ... }],
    executive_development: [{ ... }],
    special_programmes: [{ ... }]
  },

  // Meta Information
  scraped_date: Date,
  source_url: string,
  node_id: string
}
```

### Key Extraction Methods

1. **`extractName($)`**
   - Tries multiple selectors: h2, h1, .faculty-name, etc.
   - Returns first non-empty text found

2. **`extractDepartment($)`**
   - Uses regex patterns: /Department of ../, /Dept. of .../
   - Returns department name

3. **`extractEmail($)`**
   - Uses regex pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
   - Returns first email found

4. **`extractEducation($)`**
   - Looks in tab_content1 (first tab)
   - Finds tables with education-related headers
   - Extracts degree, title, university, year
   - Validates degree keywords (phd, m., b., master, bachelor, diploma)

5. **`extractAwards($)`**
   - Looks for awards table in education tab
   - Identifies by headers: award, recognition, honour, achievement, agency
   - Extracts: title, type, agency, year, amount

6. **`extractTeachingExperience($)`**
   - Extracts: designation, department, institution, duration

7. **`extractPhDGuidance($)`**
   - Extracts: studentName, registrationNo, registrationDate, thesisTitle, status

### Technologies Used

| Technology | Purpose |
|-----------|---------|
| **Puppeteer** | Browser automation (imported but not used in current version) |
| **Cheerio** | HTML parsing and DOM manipulation |
| **Axios** | HTTP requests to fetch page content |

### User-Agent Header
```javascript
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
```
Prevents blocking by appearing as a normal browser request.

---

## Data Flow Example

### Step 1: User Input
```
User enters Node ID: 941
User clicks "Import Faculty"
```

### Step 2: Frontend Request
```javascript
fetch('/api/scraper/faculty', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nodeId: '941' })
})
```

### Step 3: Backend Processing
```
URL: https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node=941
↓
Fetch HTML content
↓
Parse with cheerio
↓
Extract education, experience, awards, etc.
↓
Build structured object
```

### Step 4: Frontend Display
```
Result received
Display success message with tables:
- Education table
- Teaching experience table
- Research guidance table
- Awards table
```

---

## Database Integration

### Current Status
- **Saving to Database**: ❌ Not implemented
- **Current Behavior**: Scrapes and returns data (read-only)
- **Future Enhancement**: Could save to MongoDB for persistence

### Potential Database Fields
```javascript
{
  nodeId: String (unique),
  scrapedData: Object,
  scrapedDate: Date,
  lastUpdated: Date,
  faculty_id: ObjectId (if linked to faculty profile),
  // ... other fields
}
```

---

## Testing

### Test Files
1. `Backend/test-scraper.js` - Tests scraper endpoints
2. `Backend/test-full-scraper.js` - Full scraper test
3. `Backend/test-specific-extractions.js` - Specific extraction methods

### Manual Testing

**Using curl**:
```bash
curl -X POST http://localhost:5000/api/scraper/faculty \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"941"}'
```

**Using frontend**:
1. Navigate to Faculty Importer page
2. Enter Node ID (e.g., 941)
3. Click "Import Faculty"
4. View results in tables

---

## Known Limitations

1. **No Authentication**: Endpoint is public (accessible to anyone)
2. **No Persistence**: Data scraped but not saved to database
3. **No Caching**: Re-scrapes data every time
4. **Rate Limiting**: No rate limiting (could be abused)
5. **Error Recovery**: Limited error handling for malformed HTML
6. **Timeout**: 15-second timeout for HTTP requests
7. **Dynamic Content**: Cannot scrape JavaScript-rendered content (Puppeteer prepared but not used)

---

## Future Enhancements

### Recommended Improvements

1. **Database Storage**
   - Save scraped data to MongoDB
   - Track scrape history
   - Implement cache with TTL

2. **Authentication**
   - Require admin role to scrape
   - Log who scraped which faculty

3. **Rate Limiting**
   - Max requests per IP per hour
   - Queue system for bulk imports

4. **Better Error Handling**
   - Retry logic for failed requests
   - Partial data recovery

5. **Bulk Import**
   - Import multiple faculty at once
   - Progress tracking

6. **Data Validation**
   - Validate scraped data format
   - Detect anomalies

7. **Scheduled Updates**
   - Auto-scrape data periodically
   - Sync with university database

---

## File Locations Summary

| File | Purpose | Type |
|------|---------|------|
| `frontend/src/components/FacultyImporter.js` | User interface for importing | React Component |
| `Backend/scrapers/facultyDataScraper.js` | Web scraping logic | Scraper Class |
| `Backend/index.js` | API endpoint | Express Route |
| `Backend/test-scraper.js` | API testing | Test Script |
| `Backend/test-full-scraper.js` | Full scraper test | Test Script |

---

**Last Updated**: November 9, 2025
**Status**: ✅ Fully Functional (Frontend + Backend Implemented)
