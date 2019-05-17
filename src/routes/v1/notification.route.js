const express = require('express');
const controller = require('../../controllers/notification.controller');
const { authorize, ADMIN, USER } = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(authorize([USER, ADMIN]), controller.list)
  .post(authorize(ADMIN), controller.create);

router
  .route('/:notificationId')
  .patch(authorize(ADMIN), controller.update)
  .delete(authorize(ADMIN), controller.remove);

module.exports = router;
