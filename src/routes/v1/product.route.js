const express = require('express');
const controller = require('../../controllers/product.controller');

const router = express.Router();

router
  .route('/')
  .get(controller.list)
  .post(controller.create);

router
  .route('/:productId')
  .get(controller.get)
  .patch(controller.update)
  .delete(controller.remove);

module.exports = router;
