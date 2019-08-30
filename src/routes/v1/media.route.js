const express = require('express');
const { authorize, ADMIN } = require('../../middlewares/auth');
const parser = require('../../middlewares/image-parser');

const router = express.Router();

router
  .route('/upload')
  .post(authorize(ADMIN), parser.single('image'), (req, res) => res.json(req.file));

module.exports = router;
