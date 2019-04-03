const express = require('express');
const controller = require('../../controllers/product.controller');
const { authorize, ADMIN, USER } = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(authorize([USER, ADMIN]), controller.list)
  .post(authorize(ADMIN), controller.create);

router
  .route('/:productId')
  .get(authorize([USER, ADMIN]), controller.get)
  .patch(authorize(ADMIN), controller.update)
  .delete(authorize(ADMIN), controller.remove);

module.exports = router;
