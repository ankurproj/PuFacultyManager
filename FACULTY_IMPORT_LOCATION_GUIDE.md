# Faculty Import Logic - Visual Summary & Location Guide

## 🎯 Where is Faculty Import Logic Written?

### Answer: THREE FILES

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: User Interface                                        │
│ 📄 frontend/src/components/FacultyImporter.js                  │
│ • User enters Node ID                                           │
│ • Clicks "Import Faculty" button                                │
│ • Displays results in tables                                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP POST /api/scraper/faculty
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ BACKEND: API Endpoint                                           │
│ 📄 Backend/index.js (lines 70-116)                             │
│ • Receives POST request with nodeId                             │
│ • Validates input                                               │
│ • Initializes scraper                                           │
│ • Returns scraped data                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ scrapeFacultyData(nodeId)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ SCRAPER: Web Scraping Logic                                     │
│ 📄 Backend/scrapers/facultyDataScraper.js (971 lines)          │
│ • Fetches HTML from university website                          │
│ • Parses with Cheerio                                           │
│ • Extracts education, experience, awards, etc.                 │
│ • Returns structured JSON                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📍 File Locations Map

```
Professor_Publication/
│
├── frontend/
│   └── src/
│       └── components/
│           ├── FacultyImporter.js ✓ FRONTEND LOGIC
│           ├── Layout.js
│           └── ... other components
│
└── Backend/
    ├── index.js ✓ BACKEND API ENDPOINT (lines 70-116)
    ├── test-scraper.js
    ├── test-full-scraper.js
    ├── test-specific-extractions.js
    └── scrapers/
        └── facultyDataScraper.js ✓ SCRAPER LOGIC (971 lines)
```

---

## 🔍 Component Breakdown

### Component 1: FRONTEND
```
File: frontend/src/components/FacultyImporter.js
Type: React Component
Lines: ~400
Key Function: handleSingleImport()

What it does:
├─ Displays input field for Node ID
├─ Shows "Import Faculty" button
├─ Makes POST request to /api/scraper/faculty
├─ Handles loading state
├─ Displays results in HTML tables
└─ Shows error messages if import fails

Technologies:
├─ React Hooks (useState, useEffect)
├─ Fetch API (HTTP requests)
├─ Inline CSS styling
└─ HTML table elements
```

### Component 2: BACKEND API
```
File: Backend/index.js
Location: Lines 70-116
Type: Express.js Route Handler
Route: POST /api/scraper/faculty

What it does:
├─ Receives POST request with { nodeId }
├─ Validates nodeId is provided
├─ Loads FacultyDataScraper class
├─ Calls scraper.scrapeFacultyData(nodeId)
├─ Handles errors gracefully
├─ Returns JSON response
└─ Status codes: 200, 400, 404, 500

Technologies:
├─ Express.js
├─ Node.js
├─ JavaScript
└─ JSON responses
```

### Component 3: SCRAPER
```
File: Backend/scrapers/facultyDataScraper.js
Type: JavaScript Class
Lines: 971
Main Method: scrapeFacultyData(nodeId)

What it does:
├─ Constructs URL with faculty nodeId
├─ Fetches HTML from Pondicherry University
├─ Parses HTML using Cheerio
├─ Extracts faculty information
├─ Calls 15+ extraction methods
├─ Builds structured object
└─ Returns complete faculty profile

Extraction Methods:
├─ extractName()
├─ extractDepartment()
├─ extractEmail()
├─ extractEducation()
├─ extractAwards()
├─ extractTeachingExperience()
├─ extractPhDGuidance()
├─ extractResearchInterests()
├─ extractSpecialization()
├─ extractProfileImage()
├─ extractInnovationContributions()
├─ extractPatentDetails()
├─ extractBookChapters()
├─ extractOngoingProjects()
└─ ... and 10+ more

Technologies:
├─ Cheerio (HTML parsing)
├─ Axios (HTTP requests)
├─ Puppeteer (optional browser automation)
└─ Node.js
```

---

## 📊 Data Flow Visualization

```
USER INTERACTION LAYER
┌─────────────────────────────────────────┐
│ User enters Node ID: "941"              │
│ User clicks "Import Faculty"            │
└────────────┬────────────────────────────┘
             │
             ↓
FRONTEND LAYER (FacultyImporter.js)
┌─────────────────────────────────────────┐
│ handleSingleImport()                    │
│ • Validate nodeId                       │
│ • Set loading = true                    │
│ • Prepare request body: { nodeId }      │
│ • Send POST /api/scraper/faculty        │
└────────────┬────────────────────────────┘
             │
             ↓ HTTP/HTTPS
API LAYER (Backend/index.js)
┌─────────────────────────────────────────┐
│ POST /api/scraper/faculty               │
│ • Receive { nodeId: "941" }             │
│ • Validate nodeId                       │
│ • new FacultyDataScraper()              │
│ • Call scrapeFacultyData("941")          │
└────────────┬────────────────────────────┘
             │
             ↓
SCRAPER LAYER (facultyDataScraper.js)
┌─────────────────────────────────────────┐
│ scrapeFacultyData("941")                │
│ • URL = baseUrl + "941"                 │
│ • axios.get(url)                        │
│ • cheerio.load(html)                    │
│ • extractName($)                        │
│ • extractDepartment($)                  │
│ • extractEducation($)                   │
│ • extractAwards($)                      │
│ • ... (10+ more methods)                │
│ • return fullFacultyObject              │
└────────────┬────────────────────────────┘
             │
             ↓ HTTPS
EXTERNAL DATA (Pondicherry University)
┌─────────────────────────────────────────┐
│ backup.pondiuni.edu.in                  │
│ /PU_Establishment/profile_view/?node=941│
│ • Returns HTML page                     │
│ • Contains faculty information          │
└────────────┬────────────────────────────┘
             │
             ↓
SCRAPER RESPONSE LAYER
┌─────────────────────────────────────────┐
│ {                                       │
│   "success": true,                      │
│   "data": {                             │
│     "name": "Dr. John Doe",             │
│     "department": "Computer Science",   │
│     "education": [...],                 │
│     "awards": [...],                    │
│     "research_guidance": {...},         │
│     ...                                 │
│   }                                     │
│ }                                       │
└────────────┬────────────────────────────┘
             │
             ↓ HTTP Response
FRONTEND RESPONSE HANDLING
┌─────────────────────────────────────────┐
│ setResult({ success: true, data: ... }) │
│ Display Education table                 │
│ Display Awards table                    │
│ Display Teaching Experience table       │
│ Display PhD Guidance table              │
└─────────────────────────────────────────┘
             │
             ↓
USER SEES RESULTS
┌─────────────────────────────────────────┐
│ ✓ Import Successful                     │
│                                         │
│ 🎓 Education Details                    │
│ [Table with degree, university, year]   │
│                                         │
│ 👨‍🏫 Teaching Experience                   │
│ [Table with designation, institution]   │
│                                         │
│ 🏆 Awards                               │
│ [Table with title, agency, year]        │
│                                         │
│ 🔬 PhD Research Guidance                │
│ [Table with student names, status]      │
└─────────────────────────────────────────┘
```

---

## 🔑 Key Functions

### Frontend: handleSingleImport()
```javascript
const handleSingleImport = async () => {
  if (!nodeId) return;
  setLoading(true);
  setResult(null);

  try {
    const response = await fetch('/api/scraper/faculty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId })
    });

    const data = await response.json();

    if (data.success) {
      setResult({ success: true, nodeId, data: data.data });
    } else {
      setResult({ success: false, nodeId, error: data.message });
    }
  } catch (error) {
    setResult({ success: false, nodeId, error: error.message });
  } finally {
    setLoading(false);
  }
}
```

### Backend: API Endpoint
```javascript
app.post('/api/scraper/faculty', async (req, res) => {
  try {
    const { nodeId } = req.body;
    if (!nodeId) {
      return res.status(400).json({ success: false, message: 'Node ID is required' });
    }

    const FacultyDataScraper = require('./scrapers/facultyDataScraper');
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData(nodeId);

    if (!scrapedData.name) {
      return res.status(404).json({ success: false, message: 'No faculty data found' });
    }

    res.status(200).json({ success: true, message: 'Faculty data scraped successfully', data: scrapedData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to scrape faculty data', error: error.message });
  }
});
```

### Scraper: scrapeFacultyData()
```javascript
async scrapeFacultyData(nodeId) {
  try {
    const url = `${this.baseUrl}${nodeId}`;
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0...' }
    });

    const $ = cheerio.load(response.data);

    const facultyData = {
      name: this.extractName($),
      department: this.extractDepartment($),
      school: this.extractSchool($),
      email: this.extractEmail($),
      profileImage: this.extractProfileImage($, nodeId),
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
        phd_guidance: this.extractPhDGuidance($),
        pg_guidance: this.extractPGGuidance($),
        postdoc_guidance: this.extractPostDocGuidance($)
      },
      scraped_date: new Date(),
      source_url: url,
      node_id: nodeId
    };

    return facultyData;
  } catch (error) {
    throw new Error(`Failed to scrape faculty data: ${error.message}`);
  }
}
```

---

## 🚀 Request Flow

```
Step 1: USER INPUT
┌──────────────────────────────────┐
│ Enters Node ID: "941"            │
└──────────────────────────────────┘
                │
                ↓
Step 2: FRONTEND REQUEST
┌──────────────────────────────────────────┐
│ POST /api/scraper/faculty                │
│ Body: { "nodeId": "941" }                │
└──────────────────────────────────────────┘
                │
                ↓
Step 3: BACKEND VALIDATION
┌──────────────────────────────────────────┐
│ • Check nodeId provided: ✓               │
│ • Load scraper class: ✓                  │
└──────────────────────────────────────────┘
                │
                ↓
Step 4: SCRAPER FETCHES
┌──────────────────────────────────────────┐
│ axios.get(                               │
│   'https://backup.pondiuni.edu.in/...    │
│   ?node=941'                             │
│ )                                        │
└──────────────────────────────────────────┘
                │
                ↓
Step 5: HTML PARSING
┌──────────────────────────────────────────┐
│ cheerio.load(htmlContent)                │
└──────────────────────────────────────────┘
                │
                ↓
Step 6: DATA EXTRACTION
┌──────────────────────────────────────────┐
│ • extractName()                          │
│ • extractEducation()                     │
│ • extractAwards()                        │
│ • extractPhDGuidance()                   │
│ • ... 10+ more methods                   │
└──────────────────────────────────────────┘
                │
                ↓
Step 7: RESPONSE GENERATION
┌──────────────────────────────────────────┐
│ { success: true, data: {faculty data} }  │
└──────────────────────────────────────────┘
                │
                ↓
Step 8: FRONTEND DISPLAY
┌──────────────────────────────────────────┐
│ Display tables:                          │
│ • Education                              │
│ • Awards                                 │
│ • Teaching Experience                    │
│ • PhD Guidance                           │
└──────────────────────────────────────────┘
```

---

## 📋 Summary Table

| Layer | File | Location | Type | Lines | Purpose |
|-------|------|----------|------|-------|---------|
| **Frontend** | FacultyImporter.js | `frontend/src/components/` | React Component | ~400 | User interface for import |
| **Backend** | index.js | `Backend/` | Express Route | 70-116 | API endpoint handler |
| **Scraper** | facultyDataScraper.js | `Backend/scrapers/` | Class | 971 | Web scraping logic |

---

## ✨ Quick Links to Documentation

1. **📖 Quick Reference**: [FACULTY_IMPORT_QUICK_REFERENCE.md](./FACULTY_IMPORT_QUICK_REFERENCE.md)
2. **📊 Architecture & Diagrams**: [FACULTY_IMPORT_ARCHITECTURE.md](./FACULTY_IMPORT_ARCHITECTURE.md)
3. **🔧 Complete Documentation**: [FACULTY_IMPORT_LOGIC_DOCUMENTATION.md](./FACULTY_IMPORT_LOGIC_DOCUMENTATION.md)
4. **💻 Code Examples**: [FACULTY_IMPORT_CODE_EXAMPLES.md](./FACULTY_IMPORT_CODE_EXAMPLES.md)
5. **📑 Documentation Index**: [FACULTY_IMPORT_INDEX.md](./FACULTY_IMPORT_INDEX.md)

---

## 🎯 Answer to Your Question

**"Now where is the faculty import logic is written"**

### Answer:

The faculty import logic is written in **THREE FILES**:

1. **Frontend Component**: `frontend/src/components/FacultyImporter.js`
   - Handles user interaction (input field, button)
   - Makes HTTP POST request
   - Displays results in tables

2. **Backend API Endpoint**: `Backend/index.js` (lines 70-116)
   - Receives POST request
   - Validates input
   - Initializes and calls scraper
   - Returns JSON response

3. **Web Scraper**: `Backend/scrapers/facultyDataScraper.js`
   - Fetches HTML from university website
   - Parses with Cheerio
   - Extracts faculty information
   - Returns structured data

### How They Connect:
```
FacultyImporter.js → (POST request) → index.js → (calls) → facultyDataScraper.js
   (Frontend)                          (Backend)            (Scraper)
```

---

**Created**: November 9, 2025
**Purpose**: Quick location guide for faculty import logic
**Status**: ✅ Complete
