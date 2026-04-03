import data from '../data/wallpaper.json' assert { type: 'json' };

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Home route - show available endpoints
  if (req.url === '/') {
    res.status(200).json({
      message: 'Wallpaper API is running!',
      endpoints: {
        allWallpapers: '/api/wallpapers',
        byCategory: '/api/wallpapers?category=Abstract',
        random: '/api/wallpapers/random',
        categories: '/api/categories',
        byId: '/api/wallpapers/0',
        byCategoryName: '/api/wallpapers/category/Space',
        stats: '/api/stats'
      }
    });
    return;
  }
  
  // Route: /api/wallpapers
  if (req.url === '/api/wallpapers') {
    res.status(200).json({
      total: data.Wallpapers.length,
      wallpapers: data.Wallpapers
    });
    return;
  }
  
  // Route: /api/categories
  if (req.url === '/api/categories') {
    res.status(200).json(data.Categories);
    return;
  }
  
  // Route: /api/wallpapers/random
  if (req.url === '/api/wallpapers/random') {
    const randomIndex = Math.floor(Math.random() * data.Wallpapers.length);
    res.status(200).json(data.Wallpapers[randomIndex]);
    return;
  }
  
  // Default 404
  res.status(404).json({ error: 'Endpoint not found' });
}