const fs = require('fs');

// Read the server.js file
let content = fs.readFileSync('backend/server.js', 'utf8');

// Replace all remaining component_type filters
const oldPattern = /action\.component_type !== 'option'/g;
const newPattern = `!['option', 'dropdown_option'].includes(action.component_type)`;

content = content.replace(oldPattern, newPattern);

// Write back to server.js
fs.writeFileSync('backend/server.js', content);

console.log('✅ Updated all remaining component_type filters to handle both option types'); 