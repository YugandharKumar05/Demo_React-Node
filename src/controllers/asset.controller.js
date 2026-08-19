const Asset = require('../models/asset.model');
const createCrudController = require('../utils/createCrudController');

module.exports = createCrudController(Asset, ['name', 'assetTag']);
