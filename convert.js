const fs = require('fs');

// Read your JSON file
const data = JSON.parse(fs.readFileSync('wallpaper.json', 'utf8'));

// Create JS file
const jsContent = `export const wallpapersData = ${JSON.stringify(data, null, 2)};`;

fs.writeFileSync('data/wallpapers.js', jsContent);
console.log('Conversion complete!');