const jwt = require('jsonwebtoken');
const Account = require('../models/account.model');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const account = await Account.findById(payload.sub);
  if (!account) {
    return res.status(401).json({ error: 'Account no longer exists' });
  }

  req.account = account;
  next();
}

module.exports = requireAuth;
