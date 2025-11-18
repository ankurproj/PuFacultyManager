// Faculty Node Discovery Utility
// This script helps discover faculty profile node IDs from Pondicherry University website

const axios = require('axios');
const cheerio = require('cheerio');

class FacultyNodeDiscovery {
  constructor() {
    this.baseUrl = 'https://backup.pondiuni.edu.in';
    this.departmentUrls = {
      // Add known department URLs here
      'Computer Science': '/PU_Establishment/department_view/?node=2',
      'Mathematics': '/PU_Establishment/department_view/?node=3',
      'Physics': '/PU_Establishment/department_view/?node=4',
      'Chemistry': '/PU_Establishment/department_view/?node=5',
      'Biotechnology': '/PU_Establishment/department_view/?node=6',
      // Add more departments as needed
    };
  }

  /**
   * Extract faculty node IDs from a department page
   * @param {string} departmentUrl - Department page URL
   * @returns {Array} Array of faculty node IDs and names
   */
  async extractFacultyFromDepartment(departmentUrl) {
    try {
      const fullUrl = departmentUrl.startsWith('http')
        ? departmentUrl
        : this.baseUrl + departmentUrl;

      console.log(`Fetching faculty list from: ${fullUrl}`);

      const response = await axios.get(fullUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const facultyMembers = [];

      // Look for faculty profile links
      $('a[href*="profile_view"]').each((index, element) => {
        const href = $(element).attr('href');
        const nodeMatch = href.match(/node=(\d+)/);

        if (nodeMatch) {
          const nodeId = nodeMatch[1];
          const facultyName = $(element).text().trim();

          facultyMembers.push({
            nodeId: nodeId,
            name: facultyName,
            profileUrl: href.startsWith('http') ? href : this.baseUrl + href
          });
        }
      });

      // Alternative: Look for specific faculty listing patterns
      $('.faculty-list, .staff-list, .member-list').find('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href && href.includes('profile_view')) {
          const nodeMatch = href.match(/node=(\d+)/);
          if (nodeMatch) {
            const nodeId = nodeMatch[1];
            const facultyName = $(element).text().trim();

            // Avoid duplicates
            if (!facultyMembers.find(f => f.nodeId === nodeId)) {
              facultyMembers.push({
                nodeId: nodeId,
                name: facultyName,
                profileUrl: href.startsWith('http') ? href : this.baseUrl + href
              });
            }
          }
        }
      });

      console.log(`Found ${facultyMembers.length} faculty members`);
      return facultyMembers;

    } catch (error) {
      console.error(`Error extracting faculty from ${departmentUrl}:`, error.message);
      return [];
    }
  }

  /**
   * Discover faculty from all known departments
   * @returns {Object} Department-wise faculty listing
   */
  async discoverAllFaculty() {
    const allFaculty = {};

    for (const [departmentName, departmentUrl] of Object.entries(this.departmentUrls)) {
      console.log(`\nProcessing ${departmentName} department...`);

      try {
        const faculty = await this.extractFacultyFromDepartment(departmentUrl);
        allFaculty[departmentName] = faculty;

        // Add delay between requests to be respectful
        await this.delay(2000);

      } catch (error) {
        console.error(`Failed to process ${departmentName}:`, error.message);
        allFaculty[departmentName] = [];
      }
    }

    return allFaculty;
  }

  /**
   * Search for faculty profiles by crawling general pages
   * @param {string} searchUrl - Base URL to search
   * @returns {Array} Found faculty profiles
   */
  async searchFacultyProfiles(searchUrl = null) {
    const urlsToSearch = searchUrl ? [searchUrl] : [
      '/PU_Establishment/',
      '/PU_Establishment/faculty/',
      '/PU_Establishment/departments/'
    ];

    const foundFaculty = [];

    for (const url of urlsToSearch) {
      try {
        const fullUrl = url.startsWith('http') ? url : this.baseUrl + url;
        console.log(`Searching for faculty profiles in: ${fullUrl}`);

        const response = await axios.get(fullUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(response.data);

        // Find all links that point to profile_view
        $('a[href*="profile_view"]').each((index, element) => {
          const href = $(element).attr('href');
          const nodeMatch = href.match(/node=(\d+)/);

          if (nodeMatch) {
            const nodeId = nodeMatch[1];
            const linkText = $(element).text().trim();

            // Avoid duplicates
            if (!foundFaculty.find(f => f.nodeId === nodeId)) {
              foundFaculty.push({
                nodeId: nodeId,
                name: linkText,
                profileUrl: href.startsWith('http') ? href : this.baseUrl + href,
                foundOnPage: fullUrl
              });
            }
          }
        });

        // Add delay between requests
        await this.delay(1000);

      } catch (error) {
        console.error(`Error searching ${url}:`, error.message);
      }
    }

    return foundFaculty;
  }

  /**
   * Generate a list of node IDs to try (brute force approach)
   * @param {number} startId - Starting node ID
   * @param {number} endId - Ending node ID
   * @returns {Array} Array of node IDs to test
   */
  generateNodeIdRange(startId = 900, endId = 1100) {
    const nodeIds = [];
    for (let i = startId; i <= endId; i++) {
      nodeIds.push(i.toString());
    }
    return nodeIds;
  }

  /**
   * Test if a node ID has a valid faculty profile
   * @param {string} nodeId - Node ID to test
   * @returns {Object|null} Faculty info if valid, null otherwise
   */
  async testNodeId(nodeId) {
    try {
      const url = `${this.baseUrl}/PU_Establishment/profile_view/?node=${nodeId}`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      // Check if page has faculty content
      const facultyName = $('h1, h2, .faculty-name, .name').first().text().trim();
      const hasContact = $('.contact, .email').length > 0;
      const hasEducation = $('.education, .qualification').length > 0;

      if (facultyName && (hasContact || hasEducation)) {
        return {
          nodeId: nodeId,
          name: facultyName,
          profileUrl: url,
          status: 'valid'
        };
      }

      return null;

    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // Page not found
      }
      console.error(`Error testing node ${nodeId}:`, error.message);
      return null;
    }
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to wait
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Export discovered faculty to JSON file
   * @param {Object} facultyData - Faculty data to export
   * @param {string} filename - Output filename
   */
  exportToJson(facultyData, filename = 'discovered_faculty.json') {
    const fs = require('fs');
    try {
      fs.writeFileSync(filename, JSON.stringify(facultyData, null, 2));
      console.log(`Faculty data exported to ${filename}`);
    } catch (error) {
      console.error('Error exporting faculty data:', error.message);
    }
  }
}

// Example usage
async function main() {
  const discovery = new FacultyNodeDiscovery();

  console.log('Starting faculty discovery...\n');

  // Method 1: Search from known department pages
  console.log('=== Searching from department pages ===');
  const departmentFaculty = await discovery.discoverAllFaculty();

  // Method 2: General search
  console.log('\n=== General profile search ===');
  const generalSearch = await discovery.searchFacultyProfiles();

  // Method 3: Test a range of node IDs (be careful with this - can be slow)
  console.log('\n=== Testing node ID range (sample) ===');
  const testNodeIds = ['941', '942', '943', '944', '945']; // Sample range
  const validNodes = [];

  for (const nodeId of testNodeIds) {
    const result = await discovery.testNodeId(nodeId);
    if (result) {
      validNodes.push(result);
      console.log(`✓ Valid faculty found: Node ${nodeId} - ${result.name}`);
    }
    await discovery.delay(1000); // Be respectful
  }

  // Combine results
  const allResults = {
    discovery_date: new Date().toISOString(),
    department_faculty: departmentFaculty,
    general_search: generalSearch,
    validated_nodes: validNodes,
    summary: {
      total_from_departments: Object.values(departmentFaculty).flat().length,
      total_from_general: generalSearch.length,
      total_validated: validNodes.length
    }
  };

  console.log('\n=== Discovery Summary ===');
  console.log(`Faculty from departments: ${allResults.summary.total_from_departments}`);
  console.log(`Faculty from general search: ${allResults.summary.total_from_general}`);
  console.log(`Validated nodes: ${allResults.summary.total_validated}`);

  // Export results
  discovery.exportToJson(allResults);

  // Print all unique node IDs for easy copy-paste
  const allNodeIds = new Set();
  Object.values(departmentFaculty).flat().forEach(f => allNodeIds.add(f.nodeId));
  generalSearch.forEach(f => allNodeIds.add(f.nodeId));
  validNodes.forEach(f => allNodeIds.add(f.nodeId));

  console.log('\n=== All discovered node IDs ===');
  console.log(Array.from(allNodeIds).sort((a, b) => parseInt(a) - parseInt(b)).join(', '));
}

// Run discovery if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FacultyNodeDiscovery;