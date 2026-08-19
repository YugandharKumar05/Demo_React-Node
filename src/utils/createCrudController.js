function createCrudController(Model, requiredFields = []) {
  async function list(req, res) {
    const items = await Model.find().sort({ createdAt: -1 });
    res.json(items);
  }

  async function create(req, res) {
    const missing = requiredFields.filter((field) => !req.body[field]);
    if (missing.length) {
      return res.status(400).json({ error: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required` });
    }

    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'A record with these details already exists' });
      }
      throw err;
    }
  }

  async function update(req, res) {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(item);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'A record with these details already exists' });
      }
      throw err;
    }
  }

  return { list, create, update };
}

module.exports = createCrudController;
