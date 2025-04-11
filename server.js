// Import necessary modules
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Used for auto-wake functionality
const app = express();
const PORT = process.env.PORT || 3001;  // Use environment port or fallback to 3001

// Middleware for handling cross-origin requests and JSON data
app.use(cors());
app.use(express.json());

// Store received location data
let receivedLocations = [];

// API route to receive location data
app.post('/api/location', (req, res) => {
  const location = req.body;
  console.log('✅ Location received:', location);
  
  // Save received location with timestamp
  receivedLocations.push({
    ...location,
    receivedAt: new Date().toISOString(),
  });

  // Respond with success status
  res.status(200).json({ success: true });
});

// API route to get all received locations
app.get('/api/location', (req, res) => {
  res.json(receivedLocations);
});

// ======================= Auto Wake Optimization =======================

// 1. Health check route (used for external monitoring services)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});

// 2. Auto-wake logic (runs only in production environment)
if (process.env.NODE_ENV === 'production') {
  const WAKEUP_INTERVAL = 10 * 60 * 1000; // Every 10 minutes
  const SERVICE_URL = 'https://travel-note-server.onrender.com/health';
  
  // Set interval to auto-wake the service by hitting the health check route
  setInterval(() => {
    axios.get(SERVICE_URL)
      .then(() => console.log('🔄 Auto-wake successful'))
      .catch(err => console.log('⚠️ Wake-up failed:', err.message));
  }, WAKEUP_INTERVAL);
}

// 3. Root route to display basic server information
app.get('/', (req, res) => {
  res.send(`
    <h1>Travel Note Server</h1>
    <p>Service is running | Last data received: ${receivedLocations.length} entries</p>
    <p><a href="/health">Health Check</a> | <a href="/api/location">View Locations</a></p>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Local access: http://localhost:${PORT}`);
  console.log(`🌍 External access: https://travel-note-server.onrender.com`);
  
  // Initial auto-wake when the service starts (Render production environment only)
  if (process.env.NODE_ENV === 'production') {
    axios.get('https://travel-note-server.onrender.com/health')
      .catch(() => {}); // Ignore potential failure on first call
  }
});
