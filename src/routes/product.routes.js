const createCrudRouter = require('../utils/createCrudRouter');
const productController = require('../controllers/product.controller');

module.exports = createCrudRouter(productController);
