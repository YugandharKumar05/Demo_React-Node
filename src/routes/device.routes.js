const createCrudRouter = require('../utils/createCrudRouter');
const deviceController = require('../controllers/device.controller');

module.exports = createCrudRouter(deviceController);
