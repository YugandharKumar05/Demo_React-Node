const express = require('express');

function createCrudRouter(controller) {
  const router = express.Router();

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.put('/:id', controller.update);

  return router;
}

module.exports = createCrudRouter;
