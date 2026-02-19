// ===================================
// PrepHub — Secure Adzuna Proxy Server
// ===================================
// Keeps your API keys hidden from the browser.
// The frontend calls /api/jobs, this server
// adds the real keys and forwards to Adzuna.
//
// Setup:
//   1. npm install
//   2. Fill in your keys in .env
//   3. node server.js
//   4. Open http://localhost:3001
// ===================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// Serve the PrepHub frontend (all static files)
app.use(express.static(path.join(__dirname)));

// ---- Health Check ----
app.get('/api/health', (req, res) => {
  const keysConfigured =
    process.env.ADZUNA_APP_ID !== 'your_app_id_here' &&
    process.env.ADZUNA_APP_KEY !== 'your_app_key_here';

  res.json({
    status: 'ok',
    keysConfigured,
    message: keysConfigured
      ? 'Adzuna keys are configured ✅'
      : '⚠️ Please update ADZUNA_APP_ID and ADZUNA_APP_KEY in your .env file'
  });
});

// ---- Jobs Search Proxy ----
// GET /api/jobs?keyword=react&location=India&country=in&page=1
app.get('/api/jobs', async (req, res) => {
  const { keyword = 'software developer', location = '', country = 'in', page = 1 } = req.query;

  // Build Adzuna API URL — exact format that Adzuna accepts
  let adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
  adzunaUrl += `?app_id=${process.env.ADZUNA_APP_ID}`;
  adzunaUrl += `&app_key=${process.env.ADZUNA_APP_KEY}`;
  adzunaUrl += `&results_per_page=12`;
  adzunaUrl += `&what=${encodeURIComponent(keyword)}`;
  if (location) adzunaUrl += `&where=${encodeURIComponent(location)}`;

  try {
    console.log(`[Proxy] Fetching jobs: "${keyword}" in "${location || 'anywhere'}" (${country}), page ${page}`);

    console.log(`[Proxy] URL: ${adzunaUrl.replace(process.env.ADZUNA_APP_KEY, '***')}`);
    const response = await fetch(adzunaUrl);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Proxy] Adzuna error ${response.status}:`, errText);
      return res.status(response.status).json({
        error: `Adzuna API error: ${response.status}`,
        message: errText
      });
    }

    const data = await response.json();
    console.log(`[Proxy] Returning ${data.results?.length || 0} jobs (total: ${data.count})`);
    if (data.results?.[0]) {
      const sample = data.results[0].description;
      console.log(`[Proxy] Description present: ${!!sample} | Length: ${sample?.length || 0}`);
    }
    
    // Forward clean response to frontend
    res.json({
      count: data.count || 0,
      results: data.results || []
    });
  } catch (error) {
    console.error('[Proxy] Fetch failed:', error.message);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
});

// ---- Catch-all: serve index.html for SPA routing ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log('');
  console.log('  🚀 PrepHub server running!');
  console.log(`  🌐 Open: http://localhost:${PORT}`);
  console.log(`  🔑 APP_ID:  ${process.env.ADZUNA_APP_ID ? process.env.ADZUNA_APP_ID.slice(0,4) + '****' : 'NOT SET'}`);
  console.log(`  🔑 APP_KEY: ${process.env.ADZUNA_APP_KEY ? process.env.ADZUNA_APP_KEY.slice(0,4) + '****' : 'NOT SET'}`);
  console.log('');
});