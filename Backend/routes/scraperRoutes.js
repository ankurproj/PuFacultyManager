const express = require('express');
const Professor = require('../Professor');
const FacultyDataIntegrator = require('../utils/facultyDataIntegrator');

const router = express.Router();

// Try to load scrapers with error handling
let scraper = null;
let discovery = null;

try {
  const FacultyDataScraper = require('../scrapers/facultyDataScraper');
  scraper = new FacultyDataScraper();
  console.log('✓ FacultyDataScraper loaded successfully');
} catch (error) {
  console.error('✗ Error loading FacultyDataScraper:', error.message);
}

try {
  const FacultyNodeDiscovery = require('../utils/facultyNodeDiscovery');
  discovery = new FacultyNodeDiscovery();
  console.log('✓ FacultyNodeDiscovery loaded successfully');
} catch (error) {
  console.error('✗ Error loading FacultyNodeDiscovery:', error.message);
}

/**
 * @route GET /api/scraper/test
 * @desc Test route to verify scraper routes are working
 * @access Private
 */
router.get('/test', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Scraper routes are working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test route failed',
      error: error.message
    });
  }
});

/**
 * @route POST /api/scraper/faculty/:nodeId
 * @desc Scrape and import faculty data from university website
 * @access Private (Admin only)
 */
router.post('/faculty/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { overwrite = false } = req.body;

    // Use the integrator to scrape, transform and store with proper handling
    const result = await FacultyDataIntegrator.scrapeAndStore(nodeId, {
      updateStrategy: overwrite ? 'replace' : 'merge',
      mergeOptions: { arrayMergeStrategy: 'smart_merge', conflictResolution: 'manual' }
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to scrape and store faculty data',
        error: result.error
      });
    }

    return res.status(201).json({
      success: true,
      message: `Faculty data ${result.isNewRecord ? 'imported' : (overwrite ? 'replaced' : 'updated')} successfully`,
      data: {
        professor_id: result.faculty._id,
        name: result.faculty.name,
        email: result.faculty.email,
        department: result.faculty.department,
        node_id: nodeId
      }
    });
  } catch (error) {
    console.error('Error in faculty scraping endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scrape faculty data',
      error: error.message
    });
  }
});

/**
 * @route POST /api/scraper/faculty/batch
 * @desc Scrape multiple faculty members
 * @access Private (Admin only)
 */
router.post('/faculty/batch', async (req, res) => {
  try {
    const { nodeIds, overwrite = false } = req.body;

    if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of node IDs'
      });
    }

    if (nodeIds.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 faculty members can be processed at once'
      });
    }

    const results = await FacultyDataIntegrator.batchScrapeAndStore(nodeIds, {
      updateStrategy: overwrite ? 'replace' : 'merge',
      mergeOptions: { arrayMergeStrategy: 'smart_merge', conflictResolution: 'manual' }
    });

    res.status(200).json({
      success: true,
      message: 'Batch faculty scraping completed',
      data: {
        summary: results.summary,
        successful: results.successful.map(r => ({
          nodeId: r.scrapedData.node_id,
          facultyId: r.faculty._id,
          name: r.faculty.name,
          isNewRecord: r.isNewRecord
        })),
        failed: results.failed
      }
    });

  } catch (error) {
    console.error('Error in batch faculty scraping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process batch faculty scraping',
      error: error.message
    });
  }
});

/**
 * @route GET /api/scraper/preview/:nodeId
 * @desc Preview scraped data without saving
 * @access Private
 */
router.get('/preview/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;

    if (!scraper) {
      return res.status(500).json({
        success: false,
        message: 'Faculty scraper is not available. Check server logs for initialization errors.'
      });
    }

    const scrapedData = await scraper.scrapeFacultyData(nodeId);

    res.status(200).json({
      success: true,
      message: 'Faculty data preview',
      data: scrapedData,
      note: 'This is a preview. Data has not been saved to the database.'
    });

  } catch (error) {
    console.error('Error in preview endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview faculty data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/scraper/status
 * @desc Get scraper status and statistics
 * @access Private
 */
router.get('/status', async (req, res) => {
  try {
    const totalProfessors = await Professor.countDocuments();
    const scrapedProfessors = await Professor.countDocuments({ data_source: 'web_scraping' });
    const recentlyScraped = await Professor.countDocuments({
      data_source: 'web_scraping',
      scraped_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    res.status(200).json({
      success: true,
      statistics: {
        total_professors: totalProfessors,
        scraped_professors: scrapedProfessors,
        manually_entered: totalProfessors - scrapedProfessors,
        recently_scraped: recentlyScraped,
        scraper_version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Error getting scraper status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scraper status',
      error: error.message
    });
  }
});

/**
 * @route GET /api/scraper/discover/faculty
 * @desc Discover available faculty node IDs from university website
 * @access Private (Admin only)
 */
router.get('/discover/faculty', async (req, res) => {
  try {
    console.log('Starting faculty discovery...');

    // Method 1: Search from department pages
    const departmentFaculty = await discovery.discoverAllFaculty();

    // Method 2: General search
    const generalSearch = await discovery.searchFacultyProfiles();

    // Combine and deduplicate results
    const allNodeIds = new Set();
    const facultyList = [];

    // Process department faculty
    Object.entries(departmentFaculty).forEach(([dept, faculty]) => {
      faculty.forEach(f => {
        if (!allNodeIds.has(f.nodeId)) {
          allNodeIds.add(f.nodeId);
          facultyList.push({
            ...f,
            department: dept,
            source: 'department_page'
          });
        }
      });
    });

    // Process general search results
    generalSearch.forEach(f => {
      if (!allNodeIds.has(f.nodeId)) {
        allNodeIds.add(f.nodeId);
        facultyList.push({
          ...f,
          source: 'general_search'
        });
      }
    });

    // Check which faculty already exist in database
    const existingProfessors = await Professor.find(
      { node_id: { $in: Array.from(allNodeIds) } },
      { node_id: 1, name: 1, email: 1 }
    );

    const existingNodeIds = new Set(existingProfessors.map(p => p.node_id));

    const summary = {
      total_discovered: facultyList.length,
      already_imported: existingProfessors.length,
      available_to_import: facultyList.length - existingProfessors.length,
      departments_found: Object.keys(departmentFaculty).length
    };

    res.status(200).json({
      success: true,
      message: 'Faculty discovery completed',
      summary,
      faculty: facultyList.map(f => ({
        ...f,
        already_imported: existingNodeIds.has(f.nodeId)
      })),
      existing_professors: existingProfessors,
      discovery_date: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in faculty discovery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover faculty',
      error: error.message
    });
  }
});

/**
 * @route POST /api/scraper/discover/test-nodes
 * @desc Test a range of node IDs to find valid faculty profiles
 * @access Private (Admin only)
 */
router.post('/discover/test-nodes', async (req, res) => {
  try {
    const { startId = 900, endId = 1000, nodeIds } = req.body;

    let testNodes;
    if (nodeIds && Array.isArray(nodeIds)) {
      testNodes = nodeIds;
    } else {
      if (endId - startId > 100) {
        return res.status(400).json({
          success: false,
          message: 'Range too large. Maximum 100 node IDs can be tested at once.'
        });
      }
      testNodes = discovery.generateNodeIdRange(startId, endId);
    }

    const validNodes = [];
    const invalidNodes = [];

    console.log(`Testing ${testNodes.length} node IDs...`);

    for (const nodeId of testNodes) {
      try {
        const result = await discovery.testNodeId(nodeId);
        if (result) {
          validNodes.push(result);
          console.log(`✓ Valid: Node ${nodeId} - ${result.name}`);
        } else {
          invalidNodes.push(nodeId);
        }

        // Add delay to be respectful
        await discovery.delay(1000);

      } catch (error) {
        console.error(`Error testing node ${nodeId}:`, error.message);
        invalidNodes.push(nodeId);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Node testing completed',
      summary: {
        total_tested: testNodes.length,
        valid_nodes: validNodes.length,
        invalid_nodes: invalidNodes.length
      },
      valid_faculty: validNodes,
      invalid_node_ids: invalidNodes,
      test_date: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error testing nodes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test node IDs',
      error: error.message
    });
  }
});

module.exports = router;