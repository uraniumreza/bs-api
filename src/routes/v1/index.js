const express = require('express');
const productRoutes = require('./product.route');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const mediaRoutes = require('./media.route');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);

module.exports = router;
