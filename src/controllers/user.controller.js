const User = require('../models/user.model');

async function createUser(req, res) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const user = await User.create({ name, email });
  res.status(201).json(user);
}

async function bulkCreateUsers(req, res) {
  const { users } = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: 'users array is required' });
  }

  const created = [];
  const failed = [];

  for (const entry of users) {
    const name = String(entry?.name || '').trim();
    const email = String(entry?.email || '').trim();

    if (!name || !email) {
      failed.push({ name, email, error: 'name and email are required' });
      continue;
    }

    try {
      const user = await User.create({ name, email });
      created.push(user);
    } catch (err) {
      if (err.code === 11000) {
        failed.push({ name, email, error: 'Email already exists' });
      } else {
        failed.push({ name, email, error: err.message });
      }
    }
  }

  res.status(201).json({ created, failed });
}

async function getUsers(req, res) {
  const users = await User.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
  res.json(users);
}

async function getDeletedUsers(req, res) {
  const users = await User.find({ isDeleted: true }).sort({ updatedAt: -1 });
  res.json(users);
}

async function updateUser(req, res) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email },
    { new: true, runValidators: true }
  );
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
}

async function deleteUser(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(204).send();
}

module.exports = { createUser, bulkCreateUsers, getUsers, getDeletedUsers, updateUser, deleteUser };
