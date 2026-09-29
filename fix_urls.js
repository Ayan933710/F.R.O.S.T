const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let modifiedFiles = 0;

walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix backticks: `http://localhost:5000/api...` -> `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api...`
    content = content.replace(/`http:\/\/localhost:5000/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000\'}');
    content = content.replace(/`ws:\/\/localhost:5000/g, '`${import.meta.env.VITE_WS_URL || \'ws://localhost:5000\'}');

    // Fix single quotes: 'http://localhost:5000/api...' -> (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api...'
    // If it's exactly 'http://localhost:5000', we don't need the + ''
    content = content.replace(/'http:\/\/localhost:5000'/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000')");
    content = content.replace(/'ws:\/\/localhost:5000'/g, "(import.meta.env.VITE_WS_URL || 'ws://localhost:5000')");
    
    // For single quotes with paths: 'http://localhost:5000/api/...' -> (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/...'
    content = content.replace(/'http:\/\/localhost:5000(\/[^']*)'/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000') + '$1'");
    content = content.replace(/'ws:\/\/localhost:5000(\/[^']*)'/g, "(import.meta.env.VITE_WS_URL || 'ws://localhost:5000') + '$1'");

    // Fix double quotes similarly
    content = content.replace(/"http:\/\/localhost:5000"/g, '(import.meta.env.VITE_API_URL || "http://localhost:5000")');
    content = content.replace(/"ws:\/\/localhost:5000"/g, '(import.meta.env.VITE_WS_URL || "ws://localhost:5000")');
    content = content.replace(/"http:\/\/localhost:5000(\/[^"]*)"/g, '(import.meta.env.VITE_API_URL || "http://localhost:5000") + "$1"');
    content = content.replace(/"ws:\/\/localhost:5000(\/[^"]*)"/g, '(import.meta.env.VITE_WS_URL || "ws://localhost:5000") + "$1"');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
    }
  }
});

console.log(`Successfully updated URLs in ${modifiedFiles} files!`);
