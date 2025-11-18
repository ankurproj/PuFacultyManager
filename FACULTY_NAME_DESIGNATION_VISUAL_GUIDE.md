# Faculty Name and Designation Extraction - Visual Guide

## 🎯 Problem Statement

The HTML structure contains both faculty name and designation in a single `<h2>` tag:

```html
<div class="x_title">
  <h2>JAYAKUMAR S.K.V <small>Professor</small></h2>
</div>
```

**Previous Behavior:** ❌ Name extraction included designation
- Result: `"JAYAKUMAR S.K.V Professor"` (WRONG)

**New Behavior:** ✅ Name and designation properly separated
- Name: `"JAYAKUMAR S.K.V"`
- Designation: `"Professor"`

---

## 📊 Data Extraction Comparison

### Before Changes ❌

```
Input HTML:
┌──────────────────────────────────────────┐
│ <h2>JAYAKUMAR S.K.V <small>...</small></h2> │
└──────────────────────────────────────────┘
           ↓
       OLD CODE
           ↓
extractName() function:
  $(h2).text().trim()
           ↓
    Includes EVERYTHING
           ↓
Output:
{
  "name": "JAYAKUMAR S.K.V Professor",  ❌ WRONG
  "designation": undefined              ❌ MISSING
}
```

### After Changes ✅

```
Input HTML:
┌──────────────────────────────────────────┐
│ <h2>JAYAKUMAR S.K.V <small>...</small></h2> │
└──────────────────────────────────────────┘
        ↙              ↘
    NEW CODE (2 Methods)
    ↙              ↘
extractName()      extractDesignation()
  (remove small)     (extract small)
    ↓                  ↓
Output:
{
  "name": "JAYAKUMAR S.K.V",    ✅ CORRECT
  "designation": "Professor"     ✅ CORRECT
}
```

---

## 🔧 Code Changes Overview

### Change 1: Add Designation Field
```javascript
// Backend/scrapers/facultyDataScraper.js (Line 32)

const facultyData = {
  name: this.extractName($),
  designation: this.extractDesignation($),  // ← NEW
  department: this.extractDepartment($),
  // ...
};
```

---

### Change 2: Update extractName() Method

#### Method Signature
```javascript
extractName($)  // Extract faculty name from h2 tag
```

#### Algorithm Flow

```
START
  │
  ├─ Get h2 element
  │  │
  │  ├─ IF found:
  │  │  ├─ Clone the element
  │  │  ├─ Remove <small> tags
  │  │  ├─ Get text
  │  │  └─ Return name ✅
  │  │
  │  └─ IF not found:
  │     └─ Try fallback selectors
  │
  ├─ Try: h1, .faculty-name, .name, .profile-name
  │  └─ (Same process: clone, remove small, extract)
  │
  └─ Return empty string if nothing found
```

#### Code Structure
```javascript
extractName($) {
  // Step 1: Primary selector (h2)
  const h2Element = $('h2').first();
  if (h2Element.length) {
    const nameOnly = h2Element.clone();
    nameOnly.find('small').remove();      // ← KEY: Remove designation
    const name = nameOnly.text().trim();
    if (name) return name;
  }

  // Step 2: Fallback selectors
  const selectors = ['h1', '.faculty-name', '.name', '.profile-name'];
  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length && element.text().trim()) {
      const nameText = element.clone();
      nameText.find('small').remove();    // ← Remove from fallback too
      const name = nameText.text().trim();
      if (name) return name;
    }
  }

  return '';
}
```

---

### Change 3: Add extractDesignation() Method

#### Method Signature
```javascript
extractDesignation($)  // Extract faculty designation from h2/small tag
```

#### Algorithm Flow

```
START
  │
  ├─ Look in h2 > small (Primary)
  │  │
  │  ├─ IF found:
  │  │  ├─ Get text
  │  │  └─ Return designation ✅
  │  │
  │  └─ IF not found:
  │     └─ Try fallback
  │
  ├─ Look for small tag anywhere (Fallback)
  │  │
  │  ├─ IF found:
  │  │  ├─ Get text
  │  │  ├─ Validate against list
  │  │  │  (Professor, Associate Professor, etc.)
  │  │  │
  │  │  ├─ IF valid:
  │  │  │  └─ Return designation ✅
  │  │  │
  │  │  └─ IF invalid:
  │  │     └─ Continue
  │  │
  │  └─ IF not found:
  │     └─ Return empty
  │
  └─ Return empty string
```

#### Code Structure
```javascript
extractDesignation($) {
  // Step 1: Primary selector (h2 > small)
  const smallInH2 = $('h2 small').first();
  if (smallInH2.length) {
    const designation = smallInH2.text().trim();
    if (designation) return designation;
  }

  // Step 2: Fallback selector (any small tag)
  const smallElement = $('small').first();
  if (smallElement.length) {
    const designation = smallElement.text().trim();

    // Step 3: Validate designation
    const validDesignations = [
      'Professor',
      'Associate Professor',
      'Assistant Professor',
      'Lecturer',
      'Senior Lecturer',
      'Adjunct Professor',
      'Visiting Professor',
      'Research Scholar',
      'Post Doc'
    ];

    if (validDesignations.some(d =>
        designation.toLowerCase().includes(d.toLowerCase()))) {
      return designation;
    }
  }

  return '';
}
```

---

### Change 4: Update Frontend Display

#### Component Added
```jsx
{/* Faculty Name and Designation */}
{(result.data.name || result.data.designation) && (
  <div style={{ /* styling */ }}>
    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#2c3e50' }}>
      {result.data.name}
    </div>
    {result.data.designation && (
      <div style={{ fontSize: '1.2rem', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>
        {result.data.designation}
      </div>
    )}
  </div>
)}
```

#### Visual Output
```
┌─────────────────────────────────────────┐
│ JAYAKUMAR S.K.V                         │  ← 1.6rem, bold
│ Professor                               │  ← 1.2rem, italic
└─────────────────────────────────────────┘
   Light blue background with blue left border
```

---

## 🌳 File Locations

### Backend Scraper
```
Backend/
└── scrapers/
    └── facultyDataScraper.js
        ├── Line 32: Added designation field
        ├── Lines 122-155: Updated extractName()
        └── Lines 157-183: Added extractDesignation()
```

### Frontend Component
```
frontend/
└── src/
    └── components/
        └── FacultyImporter.js
            └── Lines 212-230: Added name/designation display
```

---

## 📝 Example Usage

### Scenario: Scraping Professor Jayakumar's Profile

#### Step 1: Backend Receives Request
```json
POST /api/scraper/faculty
{
  "nodeId": "941"
}
```

#### Step 2: Scraper Fetches HTML
```html
<div class="x_title">
  <h2>JAYAKUMAR S.K.V <small>Professor</small></h2>
</div>
```

#### Step 3: Extraction Methods Process HTML

**extractName() Processing:**
```
Input Element:  <h2>JAYAKUMAR S.K.V <small>Professor</small></h2>
Clone:          <h2>JAYAKUMAR S.K.V <small>Professor</small></h2>
Remove small:   <h2>JAYAKUMAR S.K.V </h2>
Extract text:   "JAYAKUMAR S.K.V"
Output:         "JAYAKUMAR S.K.V" ✅
```

**extractDesignation() Processing:**
```
Find h2 > small:  <small>Professor</small>
Extract text:     "Professor"
Validate:         "Professor" in validDesignations? YES ✅
Output:           "Professor" ✅
```

#### Step 4: Backend Returns Response
```json
{
  "success": true,
  "data": {
    "name": "JAYAKUMAR S.K.V",
    "designation": "Professor",
    "department": "Computer Science",
    // ... other fields
  }
}
```

#### Step 5: Frontend Displays Result
```
┌──────────────────────────────────────────┐
│ ✅ Import Successful                     │
│ Node ID: 941                             │
├──────────────────────────────────────────┤
│ JAYAKUMAR S.K.V                          │  ← Name
│ Professor                                │  ← Designation
├──────────────────────────────────────────┤
│ 🎓 Education Details                     │
│ [Education Table]                        │
│ ... (more tables) ...                    │
└──────────────────────────────────────────┘
```

---

## ✅ Test Cases

### Test 1: Standard Format
```
Input HTML:  <h2>JOHN DOE <small>Professor</small></h2>
Output:      { name: "JOHN DOE", designation: "Professor" }
Status:      ✅ PASS
```

### Test 2: No Designation
```
Input HTML:  <h2>JANE SMITH</h2>
Output:      { name: "JANE SMITH", designation: "" }
Status:      ✅ PASS
```

### Test 3: Multiple Words in Designation
```
Input HTML:  <h2>BOB WILSON <small>Associate Professor</small></h2>
Output:      { name: "BOB WILSON", designation: "Associate Professor" }
Status:      ✅ PASS
```

### Test 4: Fallback Selector (h1)
```
Input HTML:  <h1>ALICE BROWN <small>Assistant Professor</small></h1>
Output:      { name: "ALICE BROWN", designation: "Assistant Professor" }
Status:      ✅ PASS
```

### Test 5: Class Selector Fallback
```
Input HTML:  <div class="faculty-name">MARK JONES <small>Lecturer</small></div>
Output:      { name: "MARK JONES", designation: "Lecturer" }
Status:      ✅ PASS
```

---

## 🔄 Process Flow Diagram

```
┌─────────────────────────────────────────┐
│   User Enters Node ID (e.g., "941")    │
└────────────────┬────────────────────────┘
                 │
                 ↓
        ┌────────────────┐
        │  Frontend:     │
        │ POST request   │
        │ /api/scraper   │
        └────────┬───────┘
                 │
                 ↓
        ┌────────────────┐
        │  Backend:      │
        │ API endpoint   │
        │ scrapeFacultyD │
        └────────┬───────┘
                 │
                 ↓
        ┌────────────────────────┐
        │ Fetch HTML from:       │
        │ backup.pondiuni.edu.in │
        └────────┬───────────────┘
                 │
                 ↓
        ┌────────────────────────────────┐
        │ Parse HTML with Cheerio        │
        │ <h2>NAME <small>TITLE</small>  │
        └────────┬─────────────────────┬─┘
                 │                     │
           ┌─────▼──┐          ┌──────▼──┐
           │ extract│          │ extract │
           │  Name()│          │ Design. │
           └─────┬──┘          └──────┬──┘
                 │                    │
           NAME  │                    │  DESIGNATION
        (remove  │                    │  (extract
         small)  │                    │   only)
                 │                    │
        ┌────────▼────────────────────▼──┐
        │   Create Faculty Data Object   │
        │ {name, designation, ...}       │
        └────────┬─────────────────────── ┘
                 │
                 ↓
        ┌────────────────────┐
        │  Return JSON       │
        │  Response to       │
        │  Frontend          │
        └────────┬───────────┘
                 │
                 ↓
        ┌────────────────────────┐
        │ Frontend Renders:      │
        │ ┌──────────────────┐   │
        │ │ NAME             │   │
        │ │ DESIGNATION      │   │
        │ └──────────────────┘   │
        └────────────────────────┘
```

---

## 🎨 Visual Styling

### Name and Designation Card

```
┌─ Left Border ─────────────────────────────────┐
│                                               │
│  JAYAKUMAR S.K.V                              │
│  Font Size: 1.6rem (25.6px)                   │
│  Font Weight: bold                            │
│  Color: #2c3e50 (dark blue-gray)              │
│                                               │
│  Professor                                    │
│  Font Size: 1.2rem (19.2px)                   │
│  Font Style: italic                           │
│  Color: #555 (medium gray)                    │
│  Margin Top: 8px                              │
│                                               │
│  Background: #e8f4f8 (light cyan)            │
│  Padding: 20px                                │
│  Border Radius: 12px                          │
│  Border Left: 4px solid #007bff (blue)       │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 📈 Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Name Extraction** | Includes designation | Excludes designation ✅ |
| **Designation Field** | Not present ❌ | Added to data object ✅ |
| **Extraction Method** | Single method | Two specialized methods ✅ |
| **Fallback Strategy** | Basic selectors | Multi-level with validation ✅ |
| **Frontend Display** | Name only (if shown) | Name + Designation ✅ |
| **API Response** | Single name field | name + designation fields ✅ |

---

**Updated:** November 9, 2025
**Status:** ✅ Complete
