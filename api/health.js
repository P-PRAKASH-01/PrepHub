// /api/health — Vercel Serverless Function
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const keysConfigured = !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);

  return res.status(200).json({
    status: 'ok',
    keysConfigured,
    message: keysConfigured
      ? 'Adzuna API ready ✅'
      : '⚠️ Set ADZUNA_APP_ID and ADZUNA_APP_KEY in Vercel Environment Variables'
  });
};
