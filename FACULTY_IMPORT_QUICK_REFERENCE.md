# Faculty Import Logic - Summary & Quick Reference

## Quick Overview

The **Faculty Import System** is a three-layer architecture that:

1. **Accepts** a Faculty Node ID from the user (Frontend)
2. **Scrapes** faculty profile data from Pondicherry University website (Backend)
3. **Returns** structured data displaying education, experience, awards, etc. (Response)

---

## Key Components

### 1. Frontend: `FacultyImporter.js`
- **Location**: `frontend/src/components/FacultyImporter.js`
- **Purpose**: User interface for importing faculty data
- **Main Function**: `handleSingleImport()`
- **Input**: Faculty Node ID (e.g., "941")
- **Output**: Displays tables with scraped data

### 2. Backend: `index.js` (API Endpoint)
- **Location**: `Backend/index.js` (Lines 70-116)
- **Route**: `POST /api/scraper/faculty`
- **Authentication**: None (public route)
- **Purpose**: Handles scraping requests

### 3. Scraper: `facultyDataScraper.js`
- **Location**: `Backend/scrapers/facultyDataScraper.js`
- **Purpose**: Web scraping logic using Cheerio
- **Main Function**: `scrapeFacultyData(nodeId)`
- **Source**: `https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node={nodeId}`

---

## Data Flow

```
User enters Node ID (941)
        ↓
User clicks "Import Faculty"
        ↓
Frontend POST to /api/scraper/faculty
        ↓
Backend loads FacultyDataScraper
        ↓
Fetch HTML from Pondicherry University
        ↓
Parse HTML with Cheerio
        ↓
Extract: name, department, education, experience, awards, guidance, etc.
        ↓
Return JSON response
        ↓
Frontend displays results in tables
```

---

## Request & Response Format

### Request
```javascript
POST /api/scraper/faculty
Content-Type: application/json

{
  "nodeId": "941"
}
```

### Response (Success)
```javascript
{
  "success": true,
  "message": "Faculty data scraped successfully",
  "data": {
    "name": "Dr. John Doe",
    "department": "Department of Computer Science",
    "school": "School of Science",
    "email": "john.doe@pondiuni.edu.in",
    "profileImage": "https://...",
    "home": {
      "education": [...],
      "specialization": [...],
      "awards": [...],
      "researchInterests": [...]
    },
    "experience": { ... },
    "research_guidance": { ... },
    ...
  }
}
```

### Response (Error)
```javascript
{
  "success": false,
  "message": "Node ID is required" // or other error message
}
```

---

## Frontend Tables Displayed

| Table | Data Source | Fields |
|-------|-------------|--------|
| **Education** | `result.data.home.education` | Degree, Title, University, Year |
| **Teaching Experience** | `result.data.experience.teaching` | Designation, Department, Institution, Duration |
| **PhD Guidance** | `result.data.research_guidance.phd_guidance` | Student Name, Reg No, Reg Date, Thesis, Status |
| **Awards** | `result.data.home.awards` | Title, Type, Agency, Year, Amount |

---

## File Locations

| File | Type | Purpose |
|------|------|---------|
| `frontend/src/components/FacultyImporter.js` | React Component | UI for import |
| `Backend/index.js` | Express Route | API endpoint |
| `Backend/scrapers/facultyDataScraper.js` | Scraper Class | Scraping logic |
| `Backend/test-scraper.js` | Test Script | API testing |
| `Backend/test-full-scraper.js` | Test Script | Full test |

---

## Data Structure

```javascript
Faculty Profile = {
  // Basic Info
  name, department, school, email, profileImage,

  // Home Section
  home: {
    education: [{ degree, title, university, graduationYear }],
    specialization: [string],
    awards: [{ title, type, agency, year, amount }],
    researchInterests: [string]
  },

  // Experience
  experience: {
    teaching: [{ designation, department, institution, duration }],
    research: [...],
    industry: [...]
  },

  // Innovation
  innovation: {
    contributions, patents, ugc_papers, non_ugc_papers
  },

  // Books
  books: {
    authored_books, book_chapters, edited_books
  },

  // Projects
  projects_consultancy: {
    ongoing_projects, completed_projects,
    ongoing_consultancy, completed_consultancy
  },

  // Research Guidance
  research_guidance: {
    pg_guidance: [],
    phd_guidance: [{ studentName, registrationNo, registrationDate, thesisTitle, status }],
    postdoc_guidance: []
  },

  // Conferences
  conferences_seminars: {
    e_lectures, online_education, invited_talks,
    organized_conferences, organized_workshops
  },

  // Collaboration
  collaboration: {
    participation_extension, institutional_collaboration
  },

  // Programmes
  programmes: {
    faculty_development, executive_development, special_programmes
  },

  // Meta
  scraped_date, source_url, node_id
}
```

---

## Key Functions

### Frontend
```javascript
handleSingleImport()          // Trigger import
setLoading(true/false)        // Loading state
setResult(data)               // Display results
```

### Backend
```javascript
app.post('/api/scraper/faculty', ...)  // API endpoint
scraper.scrapeFacultyData(nodeId)      // Main scraping
```

### Scraper
```javascript
extractName($)                // Get faculty name
extractDepartment($)          // Get department
extractEducation($)           // Get education
extractAwards($)              // Get awards
extractTeachingExperience($)  // Get teaching exp
extractPhDGuidance($)         // Get PhD students
```

---

## Technologies Used

| Technology | Purpose |
|-----------|---------|
| **Cheerio** | Parse HTML and extract data |
| **Axios** | Make HTTP requests |
| **Express.js** | Backend API framework |
| **React** | Frontend UI framework |
| **Puppeteer** | (Optional) Browser automation |

---

## How to Use

### Step 1: Start Backend
```bash
cd Backend
npm install
npm start
```

### Step 2: Start Frontend
```bash
cd frontend
npm start
```

### Step 3: Navigate to Import Page
- Visit `/faculty-importer` route

### Step 4: Enter Node ID
- Example: `941`

### Step 5: Click "Import Faculty"
- Wait for results
- View displayed tables

---

## API Testing

### Using curl
```bash
curl -X POST http://localhost:5000/api/scraper/faculty \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"941"}'
```

### Using fetch (Browser)
```javascript
fetch('/api/scraper/faculty', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nodeId: '941' })
})
.then(r => r.json())
.then(data => console.log(data))
```

### Using axios (Node.js)
```javascript
const axios = require('axios');
axios.post('/api/scraper/faculty', { nodeId: '941' })
  .then(r => console.log(r.data))
  .catch(e => console.error(e))
```

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | Success | Faculty data retrieved |
| **400** | Bad Request | Missing nodeId |
| **404** | Not Found | No faculty data for nodeId |
| **500** | Server Error | Scraper error or timeout |

---

## Common Issues & Solutions

### Issue: "Node ID is required"
- **Solution**: Make sure nodeId is provided in the request body

### Issue: "No faculty data found"
- **Solution**: Check if nodeId is correct (must be valid Pondicherry University faculty ID)

### Issue: "Faculty data scraper not available"
- **Solution**: Ensure `facultyDataScraper.js` exists in Backend/scrapers/

### Issue: Timeout error
- **Solution**: University website might be down or slow; try again

### Issue: Empty results
- **Solution**: HTML structure might have changed; update extraction methods

---

## Features

✅ **Implemented**
- Single faculty import by Node ID
- Education extraction
- Experience extraction
- Awards extraction
- Research guidance extraction
- Multiple extraction methods
- Error handling
- Loading state
- Result display in tables

❌ **Not Implemented**
- Database persistence
- Authentication/Authorization
- Bulk import
- Rate limiting
- Caching
- Scheduled updates
- Dynamic content scraping (Puppeteer)

---

## Future Enhancements

1. **Save to Database** - Persist scraped data
2. **Authentication** - Require admin role
3. **Bulk Import** - Import multiple faculty at once
4. **Rate Limiting** - Prevent abuse
5. **Caching** - Cache scraped data with TTL
6. **Validation** - Validate scraped data
7. **Scheduled Jobs** - Auto-scrape periodically
8. **Search** - Search scraped faculty by name/ID

---

## Performance Notes

- **Request Timeout**: 15 seconds
- **User-Agent**: Mimics Chrome browser
- **Parser**: Cheerio (fast DOM parsing)
- **No Database Queries**: Pure scraping, no persistence
- **Response Time**: Usually 2-5 seconds depending on network

---

## Security Considerations

### Current
- ❌ No authentication required (public endpoint)
- ❌ No rate limiting
- ❌ No CORS restrictions
- ❌ No input validation beyond null check

### Recommended
- ✅ Add JWT authentication
- ✅ Implement rate limiting
- ✅ Add CORS configuration
- ✅ Validate nodeId format
- ✅ Log all scraping requests
- ✅ Monitor for abuse

---

## Documentation Files Created

1. **FACULTY_IMPORT_LOGIC_DOCUMENTATION.md** - Complete technical documentation
2. **FACULTY_IMPORT_ARCHITECTURE.md** - Visual diagrams and data flow
3. **FACULTY_IMPORT_CODE_EXAMPLES.md** - Code samples and implementation guide

---

## Quick Commands

```bash
# Test with curl
curl -X POST http://localhost:5000/api/scraper/faculty \
  -H "Content-Type: application/json" \
  -d '{"nodeId":"941"}'

# Run test script
node Backend/test-scraper.js

# Check logs
tail -f Backend/logs/app.log

# Debug single extraction
node Backend/test-specific-extractions.js
```

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Architecture** | Frontend → Backend → Scraper → University Website |
| **Frontend** | React component with form and tables |
| **Backend** | Express.js API endpoint |
| **Scraper** | Cheerio-based HTML parser |
| **Source** | Pondicherry University faculty profiles |
| **Authentication** | None (public) |
| **Database** | None (read-only, no persistence) |
| **Response Format** | JSON |
| **Status** | ✅ Fully Functional |

---

**Last Updated**: November 9, 2025
**Version**: 1.0
**Status**: ✅ Complete & Ready for Use
