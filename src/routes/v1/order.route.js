const express = require('express');
const controller = require('../../controllers/order.controller');
const {
  authorize, ADMIN, USER, SALES,
} = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(authorize([ADMIN, USER]), controller.list)
  .post(authorize([ADMIN, USER]), controller.create);

// router
//   .route('/:orderId')
//   .get(authorize([USER, ADMIN, SALES]), controller.get)
//   .patch(authorize(ADMIN), controller.update)
//   .delete(authorize(ADMIN), controller.remove);

module.exports = router;
