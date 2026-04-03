import { wallpapersData } from '../data/wallpapers.js';

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

  // GET /api/wallpapers
  if (pathname === '/api/wallpapers' || pathname === '/api/wallpapers/') {
    let result = [...wallpapersData.Wallpapers];
    
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
      page: page,
      limit: limit,
      totalPages: Math.ceil(result.length / limit),
      wallpapers: result.slice(start, end)
    });
    return;
  }
  
  // GET /api/wallpapers/random
  if (pathname === '/api/wallpapers/random') {
    const randomIndex = Math.floor(Math.random() * wallpapersData.Wallpapers.length);
    res.status(200).json(wallpapersData.Wallpapers[randomIndex]);
    return;
  }
  
  // GET /api/categories
  if (pathname === '/api/categories') {
    // Add count to each category
    const categoriesWithCount = wallpapersData.Categories.map(cat => {
      const count = wallpapersData.Wallpapers.filter(w => w.category === cat.name).length;
      return { ...cat, count };
    });
    res.status(200).json(categoriesWithCount);
    return;
  }
  
  // GET /api/stats
  if (pathname === '/api/stats') {
    const categoryCount = {};
    wallpapersData.Wallpapers.forEach(w => {
      categoryCount[w.category] = (categoryCount[w.category] || 0) + 1;
    });
    
    res.status(200).json({
      totalWallpapers: wallpapersData.Wallpapers.length,
      totalCategories: wallpapersData.Categories.length,
      categories: wallpapersData.Categories.map(c => ({
        name: c.name,
        count: categoryCount[c.name] || 0
      }))
    });
    return;
  }
  
  // GET /api/wallpapers/:id
  const singleMatch = pathname.match(/^\/api\/wallpapers\/(\d+)$/);
  if (singleMatch) {
    const id = parseInt(singleMatch[1]);
    if (id >= 0 && id < wallpapersData.Wallpapers.length) {
      res.status(200).json(wallpapersData.Wallpapers[id]);
    } else {
      res.status(404).json({ error: 'Wallpaper not found', id: id });
    }
    return;
  }
  
  // GET /api/wallpapers/category/:name
  const categoryMatch = pathname.match(/^\/api\/wallpapers\/category\/(.+)$/);
  if (categoryMatch) {
    const categoryName = decodeURIComponent(categoryMatch[1]);
    const filtered = wallpapersData.Wallpapers.filter(w => 
      w.category.toLowerCase() === categoryName.toLowerCase()
    );
    res.status(200).json({
      category: categoryName,
      count: filtered.length,
      wallpapers: filtered
    });
    return;
  }
  
  // Default route - show available endpoints
  res.status(200).json({
    message: 'Wallpaper API is running!',
    endpoints: {
      allWallpapers: '/api/wallpapers',
      paginated: '/api/wallpapers?page=1&limit=10',
      filterByCategory: '/api/wallpapers?category=Abstract',
      random: '/api/wallpapers/random',
      categories: '/api/categories',
      stats: '/api/stats',
      byId: '/api/wallpapers/0',
      byCategoryName: '/api/wallpapers/category/Space'
    }
  });
}