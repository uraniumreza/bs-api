const express = require('express');
const productRoutes = require('./product.route');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const mediaRoutes = require('./media.route');
const orderRoutes = require('./order.route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/media', mediaRoutes);
router.use('/order', orderRoutes);
router.use('/products', productRoutes);

module.exports = router;
