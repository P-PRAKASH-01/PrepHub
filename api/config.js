// ===================================
// /api/config.js
// Exposes non-secret config to frontend
// HF_TOKEN is set in Vercel Environment
// Variables — never in code
// ===================================

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).end();

  const hfToken = process.env.HF_TOKEN || null;

  return res.status(200).json({
    hfToken,
    hasHFToken: !!hfToken,
  });
};
