const Device = require('../models/device.model');
const createCrudController = require('../utils/createCrudController');

module.exports = createCrudController(Device, ['name', 'serialNumber']);
