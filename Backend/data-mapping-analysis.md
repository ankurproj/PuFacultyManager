# Data Mapping Analysis: Scraped Data vs Manual Entry Format

## Overview
This document analyzes the mapping between web-scraped faculty data and the manual data entry format stored in MongoDB, to determine compatibility and storage feasibility.

## 1. Basic Information Mapping

### Scraped Data Structure:
```javascript
{
  name: "Faculty Name",
  designation: "Professor",
  department: "Department Name",
  school: "School Name",
  email: "email@domain.com",
  profileImage: "image_url",
  node_id: "12345",
  source_url: "profile_url",
  scraped_date: Date,
}
```

### Manual Entry (MongoDB Schema):
```javascript
{
  name: String,
  email: String,
  department: String,
  designation: String,
  school: String,
  profileImage: String,
  node_id: String,
  source_url: String,
  scraped_date: Date,
  data_source: 'web_scraping' // vs 'manual'
}
```

**✅ MAPPING STATUS: FULLY COMPATIBLE**

---

## 2. Home Section Mapping

### 2.1 Education/Qualifications

#### Scraped Data:
```javascript
home: {
  education: [
    {
      degree: "Ph.D",
      title: "Research Title",
      university: "University Name",
      graduationYear: "2020"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
education: [{
  degree: String,
  title: String,
  university: String,
  graduationYear: String
}]
```

**✅ MAPPING STATUS: FULLY COMPATIBLE**

### 2.2 Awards

#### Scraped Data:
```javascript
home: {
  awards: [
    {
      title: "Award Title",
      type: "Award Type",
      agency: "Awarding Agency",
      year: "2023",
      amount: "50000"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
awards: [{
  title: String,
  type: String,
  agency: String,
  year: String,
  amount: String
}]
```

**✅ MAPPING STATUS: FULLY COMPATIBLE**

---

## 3. Experience Section Mapping

### 3.1 Teaching Experience

#### Scraped Data:
```javascript
experience: {
  teaching: [
    {
      designation: "Assistant Professor",
      department: "Computer Science",
      institution: "University Name",
      duration: "2020-2023"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
teaching_experience: [{
  designation: String,
  institution: String,
  department: String,
  from: String,
  to: String
}]
```

**⚠️ MAPPING STATUS: NEEDS TRANSFORMATION**
- Scraped `duration` → Split into `from` and `to`
- Field names match otherwise

### 3.2 Research Experience

#### Scraped Data:
```javascript
experience: {
  research: [
    {
      designation: "Research Fellow",
      department: "Physics",
      institution: "Institute Name",
      duration: "2018-2020"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
research_experience: [{
  position: String,        // ← designation
  organization: String,    // ← institution
  project: String,         // ← Not available in scraped
  from: String,
  to: String
}]
```

**⚠️ MAPPING STATUS: PARTIAL COMPATIBILITY**
- `designation` → `position`
- `institution` → `organization`
- `duration` → Split into `from` and `to`
- `project` field missing in scraped data (can be empty)

### 3.3 Industry Experience

#### Scraped Data:
```javascript
experience: {
  industry: [
    {
      designation: "Software Engineer",
      company: "Company Name",
      natureOfWork: "Development"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
industry_experience: [{
  designation: String,
  company: String,
  sector: String,      // ← Not available in scraped
  from: String,        // ← Not available in scraped
  to: String          // ← Not available in scraped
}]
```

**⚠️ MAPPING STATUS: PARTIAL COMPATIBILITY**
- Missing `sector`, `from`, `to` fields in scraped data
- `natureOfWork` not mapped in manual schema

---

## 4. Patents & Publications Mapping

### 4.1 Innovation Contributions

#### Scraped Data:
```javascript
innovation: {
  contributions: [
    {
      workName: "Innovation Title",
      specialization: "Field",
      remarks: "Description"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
innovation_contributions: [{
  work_name: String,
  specialization: String,
  remarks: String
}]
```

**✅ MAPPING STATUS: FULLY COMPATIBLE**
- Just field name case conversion needed

### 4.2 Patents

#### Scraped Data:
```javascript
innovation: {
  patents: [
    {
      title: "Patent Title",
      status: "Granted",
      patentNumber: "12345",
      yearOfAward: "2023",
      type: "Utility",
      commercializedStatus: "Yes"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
patent_details: [{
  title: String,
  status: String,
  patent_number: String,      // ← patentNumber
  date_of_award: String,      // ← yearOfAward
  awarding_agency: String,    // ← Not available
  scope: String,              // ← type (needs mapping)
  commercialized_status: String
}]
```

**⚠️ MAPPING STATUS: PARTIAL COMPATIBILITY**
- Missing `awarding_agency` in scraped data
- `type` → `scope` (semantic mapping needed)

### 4.3 UGC Approved Papers

#### Scraped Data:
```javascript
innovation: {
  ugc_papers: [
    {
      title: "Paper Title",
      authors: "Author Names",
      journalName: "Journal Name",
      volumeIssuePages: "Vol 1, Issue 2, pp 1-10",
      year: "2023",
      impactFactor: "2.5"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
ugc_approved_journals: [{
  title: String,
  authors: String,
  journal_name: String,       // ← journalName
  volume: String,             // ← Extract from volumeIssuePages
  issue: String,              // ← Extract from volumeIssuePages
  page_nos: String,           // ← Extract from volumeIssuePages
  year: String,
  impact_factor: String,      // ← impactFactor
  paper_upload: String,       // ← Not available
  paper_upload_filename: String, // ← Not available
  paper_link: String          // ← Not available
}]
```

**⚠️ MAPPING STATUS: NEEDS TRANSFORMATION**
- Need to parse `volumeIssuePages` into separate fields
- Missing file upload fields (can be empty)

---

## 5. Books Section Mapping

### 5.1 Authored Books

#### Scraped Data:
```javascript
books: {
  authored_books: [
    {
      title: "Book Title",
      authors: "Author Names",
      publisher: "Publisher Name",
      year: "2023",
      isbn: "978-1234567890"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
books: [{
  title: String,
  authors: String,
  publisher: String,
  isbn: String,
  year: String
}]
```

**✅ MAPPING STATUS: FULLY COMPATIBLE**

### 5.2 Book Chapters

#### Scraped Data:
```javascript
books: {
  book_chapters: [
    {
      chapterTitle: "Chapter Title",
      authors: "Author Names",
      bookTitle: "Book Title",
      publisher: "Publisher",
      year: "2023",
      isbn: "978-1234567890"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
chapters_in_books: [{
  chapter_title: String,    // ← chapterTitle
  authors: String,
  book_title: String,       // ← bookTitle
  publisher: String,
  year: String,
  isbn: String
}]
```

**✅ MAPPING STATUS: FULLY COMPATIBLE**
- Just field name case conversion needed

---

## 6. Projects & Consultancy Mapping

#### Scraped Data:
```javascript
projects: {
  ongoing_projects: [
    {
      title: "Project Title",
      sponsoredBy: "Funding Agency",
      period: "2023-2025",
      sanctionedAmount: "500000",
      year: "2023"
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
ongoing_projects: [{
  title_of_project: String,     // ← title
  sponsored_by: String,          // ← sponsoredBy
  period: String,
  sanctioned_amount: String,     // ← sanctionedAmount
  year: String
}]
```

**✅ MAPPING STATUS: FULLY COMPATIBLE**
- Just field name case conversion needed

---

## 7. Research Guidance Mapping

### 7.1 PhD Guidance

#### Scraped Data:
```javascript
research_guidance: {
  phd_guidance: [
    {
      studentName: "Student Name",
      registrationNo: "REG123",
      registrationDate: "2020-01-01",
      thesisTitle: "Thesis Title",
      status: "YES" // Completed/In Progress
    }
  ]
}
```

#### Manual Entry Schema:
```javascript
phd_guidance: [{
  student_name: String,                    // ← studentName
  registration_date: String,               // ← registrationDate
  registration_no: String,                 // ← registrationNo
  thesis_title: String,                    // ← thesisTitle
  thesis_submitted_status: String,         // ← Derive from status
  thesis_submitted_date: String,           // ← Not available
  vivavoce_completed_status: String,       // ← Derive from status
  date_awarded: String                     // ← Not available
}]
```

**⚠️ MAPPING STATUS: PARTIAL COMPATIBILITY**
- Missing detailed status fields in scraped data
- Simple status needs expansion to multiple status fields

---

## 8. Summary & Recommendations

### ✅ Fully Compatible Sections (Can store directly):
1. **Basic Information** - Direct mapping
2. **Education** - Direct mapping
3. **Awards** - Direct mapping
4. **Authored Books** - Direct mapping
5. **Book Chapters** - Field name conversion only
6. **Innovation Contributions** - Field name conversion only
7. **Projects/Consultancy** - Field name conversion only

### ⚠️ Needs Transformation:
1. **Experience Sections** - Date parsing, field mapping
2. **Publications** - Parse combined fields, add empty fields
3. **Patents** - Add missing fields as empty
4. **Research Guidance** - Status field expansion

### 🔄 Recommended Storage Strategy:

#### Option 1: Direct Storage with Transformation Layer
```javascript
function transformScrapedDataForDB(scrapedData) {
  return {
    // Direct mappings
    name: scrapedData.name,
    email: scrapedData.email,
    department: scrapedData.department,

    // Transform experience
    teaching_experience: scrapedData.experience.teaching.map(exp => ({
      designation: exp.designation,
      institution: exp.institution,
      department: exp.department,
      from: parseDateRange(exp.duration).from,
      to: parseDateRange(exp.duration).to
    })),

    // Transform publications
    ugc_approved_journals: scrapedData.innovation.ugc_papers.map(paper => ({
      title: paper.title,
      authors: paper.authors,
      journal_name: paper.journalName,
      ...parseVolumeIssuePages(paper.volumeIssuePages),
      year: paper.year,
      impact_factor: paper.impactFactor,
      paper_upload: '', // Empty for scraped data
      paper_upload_filename: '',
      paper_link: ''
    })),

    // Set metadata
    data_source: 'web_scraping',
    scraped_date: scrapedData.scraped_date,
    node_id: scrapedData.node_id,
    source_url: scrapedData.source_url
  };
}
```

#### Option 2: Hybrid Schema
Add scraped data as separate nested object while maintaining compatibility:

```javascript
// Add to existing schema
scraped_data: {
  type: Object,
  default: null
},
data_source: {
  type: String,
  enum: ['manual', 'web_scraping'],
  default: 'manual'
}
```

### 🎯 Final Recommendation:

**Use Option 1 (Transformation Layer)** because:
1. Maintains single data structure
2. Allows seamless querying across manual and scraped data
3. Frontend components work with both data sources
4. Can implement progressive enhancement (fill missing fields manually later)

### Required Transformation Functions:
1. `parseDateRange(duration)` - Split "2020-2023" into from/to
2. `parseVolumeIssuePages(text)` - Extract volume, issue, pages
3. `expandStatus(simpleStatus)` - Convert YES/NO to detailed status
4. `mapFieldNames(data)` - Convert camelCase to snake_case

**CONCLUSION: ✅ YES, scraped data CAN be stored in the existing database with a transformation layer.**