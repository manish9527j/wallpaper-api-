const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'data', 'wallpaper.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const categoryCount = {};
  data.Wallpapers.forEach(w => {
    categoryCount[w.category] = (categoryCount[w.category] || 0) + 1;
  });
  
  res.json({
    totalWallpapers: data.Wallpapers.length,
    totalCategories: data.Categories.length,
    categories: data.Categories.map(c => ({
      name: c.name,
      count: categoryCount[c.name] || 0
    }))
  });
};
