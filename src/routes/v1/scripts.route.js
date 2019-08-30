const express = require('express');
const { authorize, ADMIN } = require('../../middlewares/auth');
const controller = require('../../controllers/scripts.controller');

const router = express.Router();

router.route('/update-img/secure-url').post(authorize(ADMIN), controller.updateImageURL);

module.exports = router;
