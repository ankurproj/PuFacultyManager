const fs = require('fs');
const path = require('path');

// Replace hardcoded localhost URLs with environment variable
const componentsDir = path.join(__dirname, 'src', 'components');
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function replaceInFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/http:\/\/localhost:5000/g, API_URL);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

// Get all JS files in components directory
fs.readdir(componentsDir, (err, files) => {
  if (err) {
    console.error('Error reading components directory:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.js')) {
      replaceInFile(path.join(componentsDir, file));
    }
  });
});

console.log('URL replacement complete!');