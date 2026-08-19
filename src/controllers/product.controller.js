const Product = require('../models/product.model');
const createCrudController = require('../utils/createCrudController');

module.exports = createCrudController(Product, ['name', 'sku']);
