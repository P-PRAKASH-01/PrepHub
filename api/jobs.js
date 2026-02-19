// ===================================
// Vercel Serverless Function
// /api/jobs — Adzuna Proxy
// ===================================
// Keys are set as Environment Variables
// in Vercel Dashboard (never in code)

const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { keyword = 'software developer', location = '', country = 'in', page = 1 } = req.query;

  // Keys come from Vercel Environment Variables
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  if (!APP_ID || !APP_KEY) {
    return res.status(500).json({
      error: 'API keys not configured',
      message: 'Set ADZUNA_APP_ID and ADZUNA_APP_KEY in Vercel Environment Variables.'
    });
  }

  let adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
  adzunaUrl += `?app_id=${APP_ID}`;
  adzunaUrl += `&app_key=${APP_KEY}`;
  adzunaUrl += `&results_per_page=12`;
  adzunaUrl += `&what=${encodeURIComponent(keyword)}`;
  if (location) adzunaUrl += `&where=${encodeURIComponent(location)}`;

  try {
    const response = await fetch(adzunaUrl);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Adzuna API error: ${response.status}`,
        message: errText
      });
    }

    const data = await response.json();
    return res.status(200).json({
      count: data.count || 0,
      results: data.results || []
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
};
