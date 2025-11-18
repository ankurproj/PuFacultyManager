# Faculty Name & Designation Extraction - Quick Reference

## 📌 Problem & Solution

**Problem:** HTML contains name and designation in same tag
```html
<h2>JAYAKUMAR S.K.V <small>Professor</small></h2>
```

**Solution:** Extract separately into two fields
```json
{
  "name": "JAYAKUMAR S.K.V",
  "designation": "Professor"
}
```

---

## 🎯 What Changed

| Component | File | Lines | Change |
|-----------|------|-------|--------|
| **Scraper** | `Backend/scrapers/facultyDataScraper.js` | 32 | Added `designation` field |
| **Scraper** | `Backend/scrapers/facultyDataScraper.js` | 122-155 | Updated `extractName()` |
| **Scraper** | `Backend/scrapers/facultyDataScraper.js` | 157-183 | Added `extractDesignation()` |
| **Frontend** | `frontend/src/components/FacultyImporter.js` | 212-230 | Added name/designation UI |

---

## 🔧 Methods

### extractName($)
**Returns:** Faculty name without designation
**Selectors:** h2, h1, .faculty-name, .name, .profile-name
**Logic:** Clone → Remove \<small\> → Extract text

```javascript
extractName($) {
  const h2 = $('h2').first();
  if (h2.length) {
    const nameOnly = h2.clone();
    nameOnly.find('small').remove();  // ← Key step
    return nameOnly.text().trim();
  }
  // Fallback...
}
```

### extractDesignation($)
**Returns:** Designation if valid, empty string otherwise
**Selectors:** h2 small, small
**Validation:** Against common academic titles

```javascript
extractDesignation($) {
  const smallInH2 = $('h2 small').first();
  if (smallInH2.length) {
    return smallInH2.text().trim();
  }
  // Fallback...
}
```

---

## 📊 Valid Designations

```
Professor
Associate Professor
Assistant Professor
Lecturer
Senior Lecturer
Adjunct Professor
Visiting Professor
Research Scholar
Post Doc
```

**To add more:** Edit `validDesignations` array in `extractDesignation()`

---

## 🧪 Quick Test

```javascript
// Test with this HTML
const html = '<h2>JOHN DOE <small>Professor</small></h2>';

// Expected
{
  name: "JOHN DOE",           // ✅ Name only
  designation: "Professor"     // ✅ Designation only
}
```

---

## 📍 File Locations

```
Backend/scrapers/
  └── facultyDataScraper.js
      ├── 32: designation field
      ├── 122: extractName() start
      └── 157: extractDesignation() start

frontend/src/components/
  └── FacultyImporter.js
      └── 212: name/designation display
```

---

## 🔀 Data Flow

```
HTML: <h2>NAME <small>TITLE</small></h2>
  ↓
extractName()         → "NAME"
extractDesignation()  → "TITLE"
  ↓
{ name, designation }
  ↓
Frontend Display
```

---

## ⚙️ Configuration

### Add new designation:
1. Open `Backend/scrapers/facultyDataScraper.js`
2. Find `validDesignations` array (Line ~165)
3. Add your designation: `'New Designation'`
4. Test with a faculty profile

---

## 🎨 Frontend Display

```jsx
<div style={{ backgroundColor: '#e8f4f8', padding: '20px' }}>
  <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
    {result.data.name}        {/* Large, bold */}
  </div>
  <div style={{ fontSize: '1.2rem', fontStyle: 'italic', marginTop: '8px' }}>
    {result.data.designation}  {/* Smaller, italic */}
  </div>
</div>
```

---

## ✅ Verification Checklist

- [ ] Name extracted without designation
- [ ] Designation extracted correctly
- [ ] Frontend displays both fields
- [ ] API response includes both fields
- [ ] Fallback selectors work
- [ ] Validation catches invalid designations
- [ ] Empty values handled gracefully

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Name includes designation | Check if `<small>` tag is being removed |
| Designation is empty | Check HTML structure, verify selector |
| Invalid designation ignored | Add to `validDesignations` array |
| Fallback selector not working | Verify class/element names in HTML |

---

## 📝 API Response

```json
{
  "success": true,
  "data": {
    "name": "JAYAKUMAR S.K.V",      // ← New format
    "designation": "Professor",      // ← New field
    "department": "Computer Science",
    "email": "...",
    "home": { ... },
    "experience": { ... }
  }
}
```

---

## 💾 Backward Compatibility

✅ **Yes, fully backward compatible**
- New field doesn't break existing code
- Old code can ignore `designation`
- Optional field (not required)

---

## 🚀 Deployment

1. Update `Backend/scrapers/facultyDataScraper.js`
2. Update `frontend/src/components/FacultyImporter.js`
3. Restart backend service
4. Clear frontend cache
5. Test with faculty profile

---

## 📞 Common Tasks

### View name and designation:
```javascript
const { name, designation } = result.data;
console.log(`${name} - ${designation}`);
// Output: JAYAKUMAR S.K.V - Professor
```

### Validate extraction:
```javascript
if (result.data.name && result.data.designation) {
  console.log('Both fields extracted successfully');
}
```

### Add new academic title:
```javascript
// In extractDesignation()
const validDesignations = [
  // ... existing ...
  'Research Scientist',  // ← Add here
];
```

---

## 📚 Related Documentation

- `FACULTY_NAME_DESIGNATION_EXTRACTION_UPDATE.md` - Detailed changes
- `FACULTY_NAME_DESIGNATION_VISUAL_GUIDE.md` - Visual explanations
- `FACULTY_NAME_DESIGNATION_IMPLEMENTATION_SUMMARY.md` - Full summary

---

**Last Updated:** November 9, 2025
**Status:** ✅ Ready for Use
