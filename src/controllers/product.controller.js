const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Product = require('../models/product.model');

exports.list = async (req, res, next) => {
  try {
    let options = { ...req.query };
    if (req.user.role === 'user') options = { ...options, active: true };
    const products = await Product.list(options);
    const transformedProducts = products.map(product => product.transformList());
    res.status(httpStatus.OK).json(transformedProducts);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(httpStatus.CREATED).json(savedProduct);
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      const product = await Product.findById(productId).exec();
      res.status(httpStatus.OK).json(product);
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Product does not exist' });
    }
  } catch (error) {
    next(error);
  }
};

exports.update = (req, res, next) => {
  try {
    const { productId } = req.params;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      Product.findOneAndUpdate(
        { _id: productId },
        req.body,
        { new: true },
        (error, updatedProduct) => {
          if (error) next(error);
          else res.status(httpStatus.OK).json(updatedProduct);
        },
      );
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Product does not exist' });
    }
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      const result = await Product.findOneAndDelete({ _id: productId });
      res.status(httpStatus.OK).json(result.deletedCount);
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Product does not exist' });
    }
  } catch (error) {
    next(error);
  }
};
