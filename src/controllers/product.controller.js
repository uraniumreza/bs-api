const httpStatus = require('http-status');
const Product = require('../models/product.model');

exports.list = async (req, res, next) => {
  try {
    const products = await Product.list(req.query);
    const transformedProducts = products.map(product => product.transformList());
    res.json(transformedProducts);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(httpStatus.CREATED);
    res.json(savedProduct);
  } catch (error) {
    next(error);
  }
};
