const fs = require('fs');
const path = require('path');

const componentsDir = './frontend/src/components';
const productionUrl = 'https://professorpublication-production.up.railway.app';

// Components that need the getApiUrl import
const componentsToFix = [
  'Training.js',
  'ResearchGuidanceStudents.js',
  'RequestPublications.js',
  'ReportBroken.js',
  'Report.js',
  'ProjectConsultancy.js',
  'Programme.js',
  'Profile.js',
  'Patents.js',
  'ParticipationCollaboration.js',
  'MOU.js',
  'Fellowship.js',
  'EEducation.js',
  'Dashboard.js',
  'ConferenceSeminarWorkshop.js',
  'Books.js'
];

function fixComponent(componentName) {
  const filePath = path.join(componentsDir, componentName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${componentName} not found, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if getApiUrl is already imported
  if (!content.includes('import { getApiUrl }') && !content.includes('import getApiUrl')) {
    // Add import after the existing imports
    const importRegex = /import.*from.*['"];?\s*\n/g;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);

      content = content.slice(0, lastImportIndex + lastImport.length) +
                `import { getApiUrl } from '../config/api';\n` +
                content.slice(lastImportIndex + lastImport.length);
      modified = true;
    }
  }

  // Replace all hardcoded production URLs
  const urlPattern = new RegExp(`["'\`]${productionUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/api/([^"'\`]+)["'\`]`, 'g');

  content = content.replace(urlPattern, (match, apiPath) => {
    modified = true;
    return `getApiUrl("/api/${apiPath}")`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${componentName}`);
  } else {
    console.log(`ℹ️  ${componentName} already up to date`);
  }
}

console.log('🔧 Fixing API URLs in components...\n');

componentsToFix.forEach(fixComponent);

console.log('\n✨ All components processed!');