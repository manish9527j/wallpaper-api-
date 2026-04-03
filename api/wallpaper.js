const fs = require('fs');
const path = require('path');

// Load wallpaper data
const dataPath = path.join(process.cwd(), 'data', 'wallpaper.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, url } = req;
  const urlParts = url.split('?');
  const pathname = urlParts[0];
  const params = new URLSearchParams(urlParts[1] || '');

  // Route: /api/wallpapers
  if (pathname === '/api/wallpapers') {
    let result = [...data.Wallpapers];
    
    // Filter by category
    const category = params.get('category');
    if (category) {
      result = result.filter(w => w.category.toLowerCase() === category.toLowerCase());
    }
    
    // Search
    const search = params.get('search');
    if (search) {
      result = result.filter(w => 
        w.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Pagination
    const page = parseInt(params.get('page')) || 1;
    const limit = parseInt(params.get('limit')) || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    res.json({
      total: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit),
      wallpapers: result.slice(start, end)
    });
    return;
  }
  
  // Route: /api/wallpapers/random
  if (pathname === '/api/wallpapers/random') {
    const randomIndex = Math.floor(Math.random() * data.Wallpapers.length);
    res.json(data.Wallpapers[randomIndex]);
    return;
  }
  
  // Route: /api/categories
  if (pathname === '/api/categories') {
    res.json(data.Categories);
    return;
  }
  
  // Route: /api/wallpapers/:id (example: /api/wallpapers/0)
  const singleMatch = pathname.match(/^\/api\/wallpapers\/(\d+)$/);
  if (singleMatch) {
    const id = parseInt(singleMatch[1]);
    if (id >= 0 && id < data.Wallpapers.length) {
      res.json(data.Wallpapers[id]);
    } else {
      res.status(404).json({ error: 'Wallpaper not found' });
    }
    return;
  }
  
  // Route: /api/wallpapers/category/:name
  const categoryMatch = pathname.match(/^\/api\/wallpapers\/category\/(.+)$/);
  if (categoryMatch) {
    const categoryName = decodeURIComponent(categoryMatch[1]);
    const filtered = data.Wallpapers.filter(w => 
      w.category.toLowerCase() === categoryName.toLowerCase()
    );
    res.json({
      category: categoryName,
      count: filtered.length,
      wallpapers: filtered
    });
    return;
  }
  
  // 404 for unknown routes
  res.status(404).json({ error: 'Route not found' });
};
