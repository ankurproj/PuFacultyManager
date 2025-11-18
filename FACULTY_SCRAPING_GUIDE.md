# Faculty Data Web Scraping Implementation Guide

## Overview

This implementation provides a comprehensive web scraping solution for automatically importing faculty data from Pondicherry University profile pages into your faculty management system. The system can extract faculty information including personal details, education, specializations, awards, and contact information.

## Architecture Components

### 1. Backend Components

#### FacultyDataScraper (`Backend/scrapers/facultyDataScraper.js`)
- **Purpose**: Core scraping engine that extracts faculty data from university profile pages
- **Capabilities**:
  - Extract faculty name, email, department, and school information
  - Parse education qualifications and specialization areas
  - Collect awards and recognition data
  - Download and encode profile images
  - Handle batch processing of multiple faculty profiles
  - Error handling and retry mechanisms

#### Scraper API Routes (`Backend/routes/scraperRoutes.js`)
- **Endpoints**:
  - `POST /api/scraper/faculty/:nodeId` - Import single faculty
  - `POST /api/scraper/faculty/batch` - Import multiple faculty
  - `GET /api/scraper/preview/:nodeId` - Preview data before import
  - `GET /api/scraper/status` - Get scraper statistics
  - `GET /api/scraper/discover/faculty` - Discover available faculty
  - `POST /api/scraper/discover/test-nodes` - Test node ID ranges

#### Faculty Node Discovery (`Backend/utils/facultyNodeDiscovery.js`)
- **Purpose**: Automatically discover faculty profile node IDs
- **Methods**:
  - Department-based discovery
  - General website crawling
  - Node ID range testing
  - Faculty profile validation

### 2. Frontend Components

#### FacultyImporter (`frontend/src/components/FacultyImporter.js`)
- **Features**:
  - Single faculty import with preview
  - Batch import for multiple faculty
  - Real-time import status and progress
  - Error handling and success reporting
  - Overwrite protection for existing data

### 3. Database Schema Updates

The Professor schema now includes scraping metadata:
```javascript
// Web Scraping Metadata
school: { type: String, default: '' },
node_id: { type: String, default: '' },
source_url: { type: String, default: '' },
scraped_date: { type: Date },
data_source: { type: String, enum: ['manual', 'web_scraping'], default: 'manual' }
```

## How to Use the System

### 1. Access the Faculty Importer

1. Log into your dashboard
2. Click the "📥 Import Faculty Data" button
3. You'll be taken to the Faculty Importer interface

### 2. Single Faculty Import

1. **Get the Node ID**:
   - Visit a faculty profile on Pondicherry University website
   - Example: `https://backup.pondiuni.edu.in/PU_Establishment/profile_view/?node=941`
   - Extract the node ID (941 in this example)

2. **Preview the Data**:
   - Enter the node ID in the "Faculty Node ID" field
   - Click "Preview Data" to see what will be imported
   - Review the extracted information

3. **Import the Faculty**:
   - If the preview looks correct, click "Import Faculty"
   - Check "Overwrite existing faculty data" if updating existing records
   - Monitor the import status

### 3. Batch Import

1. **Prepare Node IDs**:
   - Collect multiple node IDs from faculty profiles
   - Enter them in the textarea, separated by commas
   - Example: `941, 942, 943, 944`

2. **Start Batch Import**:
   - Click "Import All Faculty"
   - Monitor the progress and results
   - Review the summary showing imported, updated, skipped, and error counts

### 4. Discover Faculty Automatically

Use the discovery API to find faculty node IDs:

```javascript
// GET /api/scraper/discover/faculty
// This will automatically crawl the university website to find faculty profiles
```

## API Usage Examples

### Preview Faculty Data
```javascript
fetch('/api/scraper/preview/941', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Import Single Faculty
```javascript
fetch('/api/scraper/faculty/941', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ overwrite: false })
})
```

### Batch Import
```javascript
fetch('/api/scraper/faculty/batch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nodeIds: ['941', '942', '943'],
    overwrite: false
  })
})
```

### Discover Faculty
```javascript
fetch('/api/scraper/discover/faculty', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Data Extraction Details

### What Gets Scraped

1. **Basic Information**:
   - Faculty name
   - Email address
   - Department
   - School/Faculty

2. **Education**:
   - Degree qualifications
   - Universities attended
   - Graduation years

3. **Professional Information**:
   - Area of expertise/specialization
   - Research interests
   - Awards and recognition

4. **Media**:
   - Profile images (converted to base64)

### Data Mapping

The scraper maps university profile data to your database schema:

```javascript
const professorData = {
  name: scrapedData.name,
  email: scrapedData.email,
  department: scrapedData.department,
  school: scrapedData.school,
  area_of_expertise: scrapedData.area_of_expertise,
  education: scrapedData.education,
  awards: scrapedData.awards,
  profileImage: scrapedData.profileImage,

  // Metadata
  node_id: scrapedData.node_id,
  source_url: scrapedData.source_url,
  scraped_date: scrapedData.scraped_date,
  data_source: 'web_scraping'
};
```

## Error Handling

The system includes comprehensive error handling:

1. **Network Errors**: Retry mechanisms for failed requests
2. **Invalid Node IDs**: Graceful handling of non-existent profiles
3. **Parsing Errors**: Fallback to partial data extraction
4. **Duplicate Prevention**: Checks for existing faculty before import
5. **Validation**: Ensures data quality before database insertion

## Best Practices

### 1. Respectful Scraping
- Built-in delays between requests
- Rate limiting to prevent server overload
- User-Agent headers for identification
- Timeout handling for slow responses

### 2. Data Quality
- Preview functionality before import
- Validation of extracted data
- Graceful handling of missing information
- Metadata tracking for audit trails

### 3. Security
- Authentication required for all scraping operations
- Admin-only access to discovery tools
- Input validation for node IDs
- Protection against SQL injection

## Monitoring and Maintenance

### 1. Scraper Status
```javascript
GET /api/scraper/status
// Returns statistics about scraping operations
```

### 2. Database Queries
```javascript
// Find all scraped faculty
Professor.find({ data_source: 'web_scraping' })

// Find recently scraped faculty
Professor.find({
  data_source: 'web_scraping',
  scraped_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
})
```

### 3. Error Tracking
Monitor the application logs for:
- Failed scraping attempts
- Network timeouts
- Parsing errors
- Database insertion failures

## Troubleshooting

### Common Issues

1. **"No faculty data found"**
   - Verify the node ID is correct
   - Check if the profile page exists
   - Ensure the website structure hasn't changed

2. **"Faculty data already exists"**
   - Use the overwrite option if updating is intended
   - Check for duplicate email addresses

3. **Network timeouts**
   - University website may be slow
   - Check internet connectivity
   - Retry the operation

4. **Parsing errors**
   - Website structure may have changed
   - Update the scraper selectors if needed

### Website Structure Changes

If the university website structure changes, update the selectors in `facultyDataScraper.js`:

```javascript
// Update these selectors based on new website structure
const nameSelector = 'h1, h2, .faculty-name, .name';
const emailSelector = 'a[href^="mailto:"], .email';
const departmentSelector = '.department, .dept';
```

## Performance Considerations

### 1. Batch Size Limits
- Maximum 50 faculty per batch import
- Built-in delays prevent server overload
- Progress tracking for large imports

### 2. Caching
- Consider implementing caching for frequently accessed profiles
- Store discovery results to avoid repeated crawling

### 3. Background Processing
- Large batch imports can be moved to background jobs
- Use queue systems for high-volume processing

## Security Considerations

### 1. Rate Limiting
- Implement rate limiting on scraping endpoints
- Monitor for unusual usage patterns

### 2. Access Control
- Restrict scraping to authorized administrators
- Log all scraping activities

### 3. Data Privacy
- Ensure compliance with university data policies
- Respect robots.txt if available
- Consider data retention policies

## Future Enhancements

### 1. Scheduled Scraping
- Implement cron jobs for regular updates
- Automated discovery of new faculty

### 2. Advanced Discovery
- Machine learning for better faculty detection
- Integration with university APIs if available

### 3. Data Validation
- Cross-reference with official university databases
- Automated data quality checks

### 4. Multi-University Support
- Extend to support other university websites
- Configurable scraping rules

This implementation provides a robust foundation for automated faculty data import while maintaining data quality, security, and respect for the source website.