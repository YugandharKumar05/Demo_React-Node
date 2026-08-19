const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../models/account.model');

function signToken(account) {
  return jwt.sign({ sub: account._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function toPublicAccount(account) {
  return { id: account._id, name: account.name, email: account.email };
}

async function signup(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  const existing = await Account.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const account = await Account.create({ name, email, password: hashedPassword });

  res.status(201).json({ token: signToken(account), account: toPublicAccount(account) });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const account = await Account.findOne({ email: email.toLowerCase().trim() });
  const passwordMatches = account && (await bcrypt.compare(password, account.password));
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ token: signToken(account), account: toPublicAccount(account) });
}

module.exports = { signup, login };
