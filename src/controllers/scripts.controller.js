const httpStatus = require('http-status');
const Product = require('../models/product.model');

exports.updateImageURL = async (req, res, next) => {
  try {
    const products = await Product.find({});
    await products.forEach(async (product) => {
      if (!product.image.includes('https')) {
        await Product.updateOne(
          { _id: product._id },
          { image: product.image.replace('http', 'https') },
        );
      }
    });

    res.status(httpStatus.OK).json({ success: true });
  } catch (error) {
    next(error);
  }
};
