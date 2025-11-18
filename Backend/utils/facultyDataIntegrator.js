/**
 * Integration Example: Scraping and Storing Faculty Data
 *
 * This example demonstrates how to:
 * 1. Scrape faculty data from university website
 * 2. Transform the data to match manual entry format
 * 3. Store in MongoDB with proper validation
 * 4. Handle conflicts with existing manual data
 */

const FacultyDataScraper = require('../scrapers/facultyDataScraper');
const DataTransformer = require('./dataTransformer');
const Professor = require('../Professor');
const bcrypt = require('bcryptjs');

class FacultyDataIntegrator {

  /**
   * Main integration workflow
   * @param {string} nodeId - Faculty node ID from university website
   * @param {Object} options - Integration options
   */
  static async scrapeAndStore(nodeId, options = {}) {
    try {
      console.log(`Starting integration workflow for faculty node: ${nodeId}`);

      // Step 1: Scrape data from university website
      console.log('Step 1: Scraping faculty data...');
      const scraper = new FacultyDataScraper();
      const scrapedData = await scraper.scrapeFacultyData(nodeId);

      console.log('Scraping completed successfully');
      console.log(`- Name: ${scrapedData.name}`);
      console.log(`- Department: ${scrapedData.department}`);
      console.log(`- Email: ${scrapedData.email}`);

      // Step 2: Transform scraped data to database format
      console.log('\nStep 2: Transforming data for database...');
      const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);

      // Step 3: Validate transformation
      console.log('\nStep 3: Validating transformation...');
      const validation = DataTransformer.validateTransformation(scrapedData, transformedData);

      if (validation.warnings.length > 0) {
        console.log('Transformation warnings:', validation.warnings);
      }

      if (validation.errors.length > 0) {
        console.error('Transformation errors:', validation.errors);
        throw new Error('Data transformation failed validation');
      }

      // Step 4: Check for existing faculty record
      console.log('\nStep 4: Checking for existing records...');
      const existingFaculty = await this.findExistingFaculty(transformedData);

      let savedFaculty;

      if (existingFaculty) {
        // Handle existing record based on options
        savedFaculty = await this.handleExistingRecord(existingFaculty, transformedData, options);
      } else {
        // Create new record
        savedFaculty = await this.createNewRecord(transformedData, options);
      }

      console.log('\nIntegration completed successfully!');
      console.log(`Faculty record saved with ID: ${savedFaculty._id}`);

      return {
        success: true,
        faculty: savedFaculty,
        scrapedData,
        transformedData,
        validation,
        isNewRecord: !existingFaculty
      };

    } catch (error) {
      console.error('Integration workflow failed:', error.message);
      return {
        success: false,
        error: error.message,
        nodeId
      };
    }
  }

  /**
   * Find existing faculty by email, node_id, or name
   */
  static async findExistingFaculty(transformedData) {
    const queries = [];

    // Search by email (most reliable)
    if (transformedData.email) {
      queries.push({ email: transformedData.email });
    }

    // Search by node_id (for previously scraped records)
    if (transformedData.node_id) {
      queries.push({ node_id: transformedData.node_id });
    }

    // Search by name and department (fallback)
    if (transformedData.name && transformedData.department) {
      queries.push({
        name: transformedData.name,
        department: transformedData.department
      });
    }

    for (const query of queries) {
      const faculty = await Professor.findOne(query);
      if (faculty) {
        console.log(`Found existing faculty record: ${faculty._id} (matched by ${Object.keys(query).join(', ')})`);
        return faculty;
      }
    }

    console.log('No existing faculty record found');
    return null;
  }

  /**
   * Handle existing faculty record - merge or update based on options
   */
  static async handleExistingRecord(existingFaculty, transformedData, options) {
    const { updateStrategy = 'merge' } = options;

    console.log(`Handling existing record with strategy: ${updateStrategy}`);

    switch (updateStrategy) {
      case 'replace':
        // Replace entire record with scraped data
        return await this.replaceRecord(existingFaculty, transformedData);

      case 'merge':
        // Merge scraped data with existing manual data
        return await this.mergeRecords(existingFaculty, transformedData, options);

      case 'skip':
        // Skip update, return existing record
        console.log('Skipping update as requested');
        return existingFaculty;

      case 'manual_priority':
        // Keep manual data, only fill empty fields with scraped data
        return await this.fillEmptyFields(existingFaculty, transformedData);

      default:
        throw new Error(`Unknown update strategy: ${updateStrategy}`);
    }
  }

  /**
   * Replace existing record completely
   */
  static async replaceRecord(existingFaculty, transformedData) {
    console.log('Replacing existing record completely...');

    // Preserve some fields that shouldn't be overwritten
    const preservedFields = {
      _id: existingFaculty._id,
      password: existingFaculty.password, // Keep existing password
      role: existingFaculty.role,         // Keep existing role
      createdAt: existingFaculty.createdAt
    };

    const updatedData = { ...transformedData, ...preservedFields };
    // Ensure we don't blank out a valid email if scraped email is missing
    if (!transformedData.email) {
      updatedData.email = existingFaculty.email;
    }

    const updatedFaculty = await Professor.findByIdAndUpdate(
      existingFaculty._id,
      updatedData,
      { new: true, runValidators: true }
    );

    console.log('Record replaced successfully');
    return updatedFaculty;
  }

  /**
   * Merge scraped data with existing manual data
   */
  static async mergeRecords(existingFaculty, transformedData, options) {
    console.log('Merging scraped data with existing record...');

    const { mergeOptions = {} } = options;
    const {
      arrayMergeStrategy = 'append',  // 'append', 'replace', 'smart_merge'
      conflictResolution = 'manual'   // 'manual', 'scraped', 'newest'
    } = mergeOptions;

    const mergedData = { ...existingFaculty.toObject() };

    // Merge basic fields (prefer manual data for core info)
    const basicFields = ['name', 'email', 'department', 'designation'];
    basicFields.forEach(field => {
      if (conflictResolution === 'scraped' || !mergedData[field]) {
        mergedData[field] = transformedData[field] || mergedData[field];
      }
    });

    // Merge array fields based on strategy
    const arrayFields = [
      'education', 'awards', 'teaching_experience', 'research_experience',
      'innovation_contributions', 'patent_details', 'ugc_approved_journals',
      'non_ugc_journals', 'conference_proceedings', 'books', 'chapters_in_books'
    ];

    arrayFields.forEach(field => {
      mergedData[field] = this.mergeArrayField(
        mergedData[field] || [],
        transformedData[field] || [],
        arrayMergeStrategy,
        field
      );
    });

    // Update metadata
    mergedData.scraped_date = transformedData.scraped_date;
    mergedData.source_url = transformedData.source_url;
    mergedData.node_id = transformedData.node_id;

    // Mark as having both manual and scraped data
    if (existingFaculty.data_source === 'manual') {
      mergedData.data_source = 'hybrid'; // Both manual and scraped
    }

    const updatedFaculty = await Professor.findByIdAndUpdate(
      existingFaculty._id,
      mergedData,
      { new: true, runValidators: true }
    );

    console.log('Records merged successfully');
    return updatedFaculty;
  }

  /**
   * Fill only empty fields with scraped data
   */
  static async fillEmptyFields(existingFaculty, transformedData) {
    console.log('Filling empty fields with scraped data...');

    const updatedData = { ...existingFaculty.toObject() };

    // Fill empty basic fields
    Object.keys(transformedData).forEach(key => {
      if (!updatedData[key] || (Array.isArray(updatedData[key]) && updatedData[key].length === 0)) {
        updatedData[key] = transformedData[key];
      }
    });

    // Always update metadata fields
    updatedData.scraped_date = transformedData.scraped_date;
    updatedData.source_url = transformedData.source_url;
    updatedData.node_id = transformedData.node_id;

    const updatedFaculty = await Professor.findByIdAndUpdate(
      existingFaculty._id,
      updatedData,
      { new: true, runValidators: true }
    );

    console.log('Empty fields filled successfully');
    return updatedFaculty;
  }

  /**
   * Create new faculty record
   */
  static async createNewRecord(transformedData, options) {
    console.log('Creating new faculty record...');

    // Generate temporary password for scraped accounts
    const tempPassword = this.generateTempPassword();

    // Ensure required fields exist
    const safeEmail = (transformedData.email && transformedData.email.trim())
      ? transformedData.email.trim()
      : `node_${transformedData.node_id || 'unknown'}@placeholder.local`;

    // Hash the temporary password to be compatible with login flow
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const facultyData = {
      ...transformedData,
      email: safeEmail,
      password: hashedPassword,
      role: 'faculty',
      data_source: 'web_scraping'
    };

    const newFaculty = new Professor(facultyData);
    const savedFaculty = await newFaculty.save();

    console.log('New faculty record created successfully');
    console.log(`Temporary password generated: ${tempPassword}`);

    return savedFaculty;
  }

  /**
   * Merge two arrays based on strategy
   */
  static mergeArrayField(existingArray, scrapedArray, strategy, fieldName) {
    switch (strategy) {
      case 'replace':
        return scrapedArray;

      case 'append':
        return [...existingArray, ...scrapedArray];

      case 'smart_merge':
        // Avoid duplicates based on title/name fields
        return this.smartMergeArrays(existingArray, scrapedArray, fieldName);

      default:
        return existingArray;
    }
  }

  /**
   * Smart merge arrays to avoid duplicates
   */
  static smartMergeArrays(existingArray, scrapedArray, fieldName) {
    const merged = [...existingArray];

    // Define key fields for duplicate detection
    const keyFields = {
      'education': ['degree', 'university'],
      'awards': ['title', 'year'],
      'ugc_approved_journals': ['title', 'year'],
      'books': ['title', 'year'],
      'patents': ['title', 'patent_number'],
      'default': ['title']
    };

    const keys = keyFields[fieldName] || keyFields.default;

    scrapedArray.forEach(scrapedItem => {
      const isDuplicate = existingArray.some(existingItem => {
        return keys.every(key =>
          existingItem[key] && scrapedItem[key] &&
          existingItem[key].toLowerCase().trim() === scrapedItem[key].toLowerCase().trim()
        );
      });

      if (!isDuplicate) {
        merged.push(scrapedItem);
      }
    });

    return merged;
  }

  /**
   * Generate temporary password for scraped accounts
   */
  static generateTempPassword() {
    return 'PU' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  /**
   * Batch processing for multiple faculty members
   */
  static async batchScrapeAndStore(nodeIds, options = {}) {
    console.log(`Starting batch processing for ${nodeIds.length} faculty members...`);

    const results = {
      successful: [],
      failed: [],
      summary: {
        total: nodeIds.length,
        success: 0,
        failure: 0,
        newRecords: 0,
        updatedRecords: 0
      }
    };

    const { batchSize = 5, delayBetweenBatches = 2000 } = options;

    // Process in batches to avoid overwhelming the server
    for (let i = 0; i < nodeIds.length; i += batchSize) {
      const batch = nodeIds.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(nodeIds.length/batchSize)}...`);

      const batchPromises = batch.map(nodeId =>
        this.scrapeAndStore(nodeId, options).catch(error => ({
          success: false,
          error: error.message,
          nodeId
        }))
      );

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach(result => {
        if (result.success) {
          results.successful.push(result);
          results.summary.success++;
          if (result.isNewRecord) {
            results.summary.newRecords++;
          } else {
            results.summary.updatedRecords++;
          }
        } else {
          results.failed.push(result);
          results.summary.failure++;
        }
      });

      // Delay between batches
      if (i + batchSize < nodeIds.length) {
        console.log(`Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    console.log('\nBatch processing completed!');
    console.log(`Summary: ${results.summary.success} successful, ${results.summary.failure} failed`);
    console.log(`New records: ${results.summary.newRecords}, Updated records: ${results.summary.updatedRecords}`);

    return results;
  }
}

module.exports = FacultyDataIntegrator;

// === USAGE EXAMPLES ===

/*

// Example 1: Scrape single faculty member
async function example1() {
  const result = await FacultyDataIntegrator.scrapeAndStore('12345');

  if (result.success) {
    console.log('Faculty data stored:', result.faculty.name);
  } else {
    console.error('Failed:', result.error);
  }
}

// Example 2: Scrape with merge strategy
async function example2() {
  const result = await FacultyDataIntegrator.scrapeAndStore('12345', {
    updateStrategy: 'merge',
    mergeOptions: {
      arrayMergeStrategy: 'smart_merge',
      conflictResolution: 'manual'
    }
  });
}

// Example 3: Batch scraping
async function example3() {
  const nodeIds = ['12345', '12346', '12347', '12348', '12349'];

  const results = await FacultyDataIntegrator.batchScrapeAndStore(nodeIds, {
    updateStrategy: 'merge',
    batchSize: 3,
    delayBetweenBatches: 3000
  });

  console.log('Batch results:', results.summary);
}

// Example 4: Manual data priority
async function example4() {
  const result = await FacultyDataIntegrator.scrapeAndStore('12345', {
    updateStrategy: 'manual_priority' // Only fill empty fields
  });
}

*/