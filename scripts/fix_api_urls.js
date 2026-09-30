/**
 * Bulk-replace hardcoded localhost API/WS patterns with centralized imports.
 * Run: node scripts/fix_api_urls.js
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'frontend', 'src');

// Patterns to replace (order matters — longest/most specific first)
const replacements = [
  // Double-wrapped pattern: `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')}`
  {
    find: /\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*\(import\.meta\.env\.VITE_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\)\}/g,
    replace: '${API_BASE}'
  },
  // Inline pattern: (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  {
    find: /\(import\.meta\.env\.VITE_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\)/g,
    replace: 'API_BASE'
  },
  // WS inline pattern: (import.meta.env.VITE_WS_URL || 'ws://localhost:5000')
  {
    find: /\(import\.meta\.env\.VITE_WS_URL\s*\|\|\s*'ws:\/\/localhost:5000'\)\s*\+\s*'(\/[^']+)'/g,
    replace: (match, wsPath) => `wsUrl('${wsPath}')`
  },
];

// Collect all .js/.jsx files
function walk(dir) {
  let results = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f === 'node_modules') continue;
      results = results.concat(walk(full));
    } else if (/\.(jsx?|tsx?)$/.test(f)) {
      results.push(full);
    }
  }
  return results;
}

const files = walk(srcDir);
let totalChanges = 0;

for (const file of files) {
  // Skip our own api.js utility
  if (file.endsWith('utils' + path.sep + 'api.js')) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  for (const r of replacements) {
    content = content.replace(r.find, typeof r.replace === 'function' ? r.replace : r.replace);
  }
  
  if (content !== original) {
    // Check if we need to add the import
    const needsApiBase = content.includes('API_BASE') && !content.includes("from '../../utils/api'") && !content.includes("from '../utils/api'") && !content.includes("from './api'") && !content.includes("from '../../../utils/api'");
    const needsWsUrl = content.includes('wsUrl(') && !content.includes("from '../../utils/api'") && !content.includes("from '../utils/api'") && !content.includes("from './api'") && !content.includes("from '../../../utils/api'");
    
    if (needsApiBase || needsWsUrl) {
      // Determine relative path to utils/api.js
      const fileDir = path.dirname(file);
      let relPath = path.relative(fileDir, path.join(srcDir, 'utils', 'api.js')).replace(/\\/g, '/');
      if (!relPath.startsWith('.')) relPath = './' + relPath;
      relPath = relPath.replace('.js', '');
      
      // Build import statement
      const imports = [];
      if (content.includes('API_BASE')) imports.push('API_BASE');
      if (content.includes('wsUrl(')) imports.push('wsUrl');
      
      const importLine = `import { ${imports.join(', ')} } from '${relPath}';\n`;
      
      // Add import after the last existing import
      const importRegex = /^import .+$/gm;
      let lastImportIndex = -1;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      
      if (lastImportIndex > -1) {
        content = content.slice(0, lastImportIndex) + '\n' + importLine + content.slice(lastImportIndex + 1);
      } else {
        content = importLine + content;
      }
    }
    
    fs.writeFileSync(file, content, 'utf8');
    totalChanges++;
    console.log(`✓ Updated: ${path.relative(srcDir, file)}`);
  }
}

console.log(`\nDone! ${totalChanges} files updated.`);
