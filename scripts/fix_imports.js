const fs = require('fs');

function fixBrokenImport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Pattern: the script broke a multi-line import by inserting after the opening {
  // Look for: "import {\n" (LF, not CRLF) followed by "import { API_BASE ..."
  // This broken pattern needs to be fixed
  
  // First, normalize line endings to \n, fix, then convert back to \r\n
  const lines = content.split(/\r?\n/);
  const newLines = [];
  let i = 0;
  let importAdded = false;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Detect the broken pattern: "import {" followed immediately by "import { API_BASE..."
    if (line.trim() === 'import {' && i + 1 < lines.length && lines[i + 1].startsWith("import { API_BASE }")) {
      // This is the broken insertion. Skip the injected import and empty line
      newLines.push('import {');
      i += 1; // skip the "import { API_BASE }" line
      // Skip any empty lines after it
      while (i < lines.length && lines[i].trim() === '') {
        i++;
      }
      // Skip the "import { API_BASE }" line
      if (lines[i] && lines[i].startsWith("import { API_BASE }")) {
        i++;
      }
      importAdded = false; // will add it properly later
      continue;
    }
    
    // Detect duplicate "import { API_BASE } from" that follows "} from 'lucide-react'"
    if (line.startsWith("import { API_BASE }") && !importAdded) {
      // Check if already properly placed (not breaking anything)
      const prevLine = newLines[newLines.length - 1];
      if (prevLine && prevLine.includes("from 'lucide-react'")) {
        newLines.push(line);
        importAdded = true;
        i++;
        continue;
      }
    }
    
    // Detect self-referencing: const API_V1 = API_V1 + ...
    if (line.match(/const API_V1 = API_V1/)) {
      newLines.push(line.replace('API_V1 = API_V1', 'API_V1 = API_BASE'));
      i++;
      continue;
    }
    
    newLines.push(line);
    i++;
  }
  
  // If import wasn't found, add it after lucide-react import
  if (!importAdded) {
    const lucideIdx = newLines.findIndex(l => l.includes("from 'lucide-react'"));
    if (lucideIdx >= 0) {
      newLines.splice(lucideIdx + 1, 0, "import { API_BASE } from '../../utils/api';");
    }
  }
  
  const result = newLines.join('\r\n');
  fs.writeFileSync(filePath, result);
  console.log('Fixed: ' + filePath);
}

// Fix both files
fixBrokenImport('frontend/src/pages/AdminDashboard/ResearchCenters.jsx');
