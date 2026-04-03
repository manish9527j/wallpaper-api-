// Direct import instead of fs.readFile
import data from '../data/wallpaper.json' assert { type: 'json' };

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req;
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
    
    res.status(200).json({
      success: true,
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
    res.status(200).json(data.Wallpapers[randomIndex]);
    return;
  }
  
  // Route: /api/categories
  if (pathname === '/api/categories') {
    res.status(200).json(data.Categories);
    return;
  }
  
  // Route: /api/wallpapers/:id
  const singleMatch = pathname.match(/^\/api\/wallpapers\/(\d+)$/);
  if (singleMatch) {
    const id = parseInt(singleMatch[1]);
    if (id >= 0 && id < data.Wallpapers.length) {
      res.status(200).json(data.Wallpapers[id]);
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
    res.status(200).json({
      category: categoryName,
      count: filtered.length,
      wallpapers: filtered
    });
    return;
  }
  
  // 404 for unknown routes
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      '/api/wallpapers',
      '/api/wallpapers?category=Abstract',
      '/api/wallpapers?page=1&limit=10',
      '/api/wallpapers/random',
      '/api/categories',
      '/api/wallpapers/0',
      '/api/wallpapers/category/Space'
    ]
  });
};