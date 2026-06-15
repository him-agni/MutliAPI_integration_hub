function requireApiKey(req, res, next) {
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    return res.status(503).json({ error: 'Admin API key is not configured' });
  }

  const providedKey = req.headers['x-api-key'];

  if (providedKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  next();
}

module.exports = requireApiKey;
