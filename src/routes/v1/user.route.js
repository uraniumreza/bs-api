const express = require('express');
const controller = require('../../controllers/user.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

router.param('userId', controller.load);

router
  .route('/')
  .get(authorize(ADMIN), controller.list)
  .post(authorize(ADMIN), controller.create);

router.route('/profile').get(authorize(), controller.loggedIn);

router
  .route('/:userId')
  .get(authorize(LOGGED_USER), controller.get)
  .patch(authorize(LOGGED_USER), controller.update)
  .delete(authorize(ADMIN), controller.remove);

module.exports = router;
