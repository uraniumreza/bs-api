const express = require('express');
const productRoutes = require('./product.route');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const mediaRoutes = require('./media.route');
const orderRoutes = require('./order.route');
const notificationRoutes = require('./notification.route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/media', mediaRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
