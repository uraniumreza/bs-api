const express = require('express');
// const { authorize, ADMIN } = require('../../middlewares/auth');
const parser = require('../../middlewares/image-parser');

const router = express.Router();

router.route('/upload').post(parser.single('image'), (req, res) => {
  const image = {};
  image.url = req.file.url;
  image.id = req.file.public_id;
  res.json(image);
});

module.exports = router;
