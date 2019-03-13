const express = require('express');
const controller = require('../../controllers/product.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(authorize(LOGGED_USER), controller.list)
  .post(authorize(ADMIN), controller.create);

router
  .route('/:productId')
  .get(authorize(LOGGED_USER), controller.get)
  .patch(authorize(ADMIN), controller.update)
  .delete(authorize(ADMIN), controller.remove);

module.exports = router;
