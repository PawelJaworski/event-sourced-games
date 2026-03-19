const fs = require('fs');
const path = require('path');

const versionData = {
  timestamp: new Date().toISOString()
};

const outputPath = path.join(__dirname, '..', 'src', 'assets', 'version.json');
fs.writeFileSync(outputPath, JSON.stringify(versionData, null, 2));
console.log(`Version file generated: ${outputPath}`);
