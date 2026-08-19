const createCrudRouter = require('../utils/createCrudRouter');
const assetController = require('../controllers/asset.controller');

module.exports = createCrudRouter(assetController);
