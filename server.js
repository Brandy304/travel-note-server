// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let receivedLocations = [];

app.post('/api/location', (req, res) => {
  const location = req.body;
  console.log('✅ Location received:', location);
  receivedLocations.push({
    ...location,
    receivedAt: new Date().toISOString()
  });
  res.status(200).json({ success: true });
});

app.get('/api/location', (req, res) => {
  res.json(receivedLocations);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
