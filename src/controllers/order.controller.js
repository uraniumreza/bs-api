const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

const verifyProducts = async (products) => {
  const productIds = [];
  await products.forEach(product => productIds.push(mongoose.Types.ObjectId(product.product_id)));

  const newProducts = await Product.find(
    {
      _id: {
        $in: products.map(({ product_id }) => product_id),
      },
    },
    {
      price: 1,
      stock_count: 1,
    },
  );

  const finalProducts = newProducts.map((product, index) => {
    const { ordered_quantity: quantity } = products[index];
    const { stock_count: stock, _id, price } = product.toObject();
    const newProduct = {
      price,
      product_id: _id,
      stock_count: stock,
      ordered_quantity: quantity,
      final_quantity: undefined,
    };

    if (stock === 0) newProduct.final_quantity = 0;
    else if (newProduct.stock_count < quantity) {
      newProduct.final_quantity = newProduct.stock_count;
    } else newProduct.final_quantity = quantity;

    return newProduct;
  });

  return finalProducts;
};

const calculatePrice = (products) => {
  let totalPrice = 0;
  products.forEach(({ price, final_quantity: quantity }) => {
    totalPrice += price * quantity;
  });
  return totalPrice;
};

const updateStock = async (product) => {
  await Product.updateOne(
    { _id: product.productId },
    { $inc: { quantity: -product.final_quantity } },
    (error) => {
      if (error) return error;
    },
  );
};

exports.create = async (req, res, next) => {
  try {
    const products = await verifyProducts(req.body.products);
    const totalPrice = await calculatePrice(products);
    const finalProducts = products.map((product) => {
      const { price, ...newProduct } = product;
      return newProduct;
    });
    const order = new Order({
      ...req.body,
      user_id: req.user._id,
      products: [...finalProducts],
      total_price: totalPrice,
      state: 'Pending',
    });
    const savedOrder = await order.save();
    res.status(httpStatus.CREATED).json(savedOrder);
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const queryString = { ...req.query };
    let { page, perPage, ...options } = queryString;
    if (req.user.role === 'user') {
      options.user_id = req.user._id;
      perPage = 0;
    } else if (req.user.role === 'sales') {
      options.sr_id = req.user._id;
    }
    const orders = await Order.list(perPage, page, options);
    Promise.all(orders.map(order => order.transformOrder())).then(data => res.status(httpStatus.OK).json(data));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const order = await Order.get(orderId);
      const transformedOrder = await order.transformOrder();
      res.status(httpStatus.OK).json(transformedOrder);
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Order does not exist' });
    }
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const order = await Order.findById(orderId, { state: 1, products: 1, _id: 0 });
      if (
        req.user.role === 'user'
        && order.state === 'Processing'
        && req.body.state === 'Delivered'
      ) {
        Order.findOneAndUpdate({ _id: orderId }, req.body, { new: true }, (error) => {
          if (error) next(error);
          else {
            res.status(httpStatus.OK).json({ message: 'Order has been moved to Delivered state!' });
          }
        });
      } else if (order.state === 'Delivered' || order.state === 'Processing') {
        res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Order is already delivered!' });
      } else if (req.body.sr_id) {
        if (mongoose.Types.ObjectId.isValid(req.body.sr_id)) {
          req.body.state = 'Processing';
          order.products.map(async (product) => {
            await updateStock(product);
          });
        } else {
          res.status(httpStatus.NOT_FOUND).json({ message: 'SR ID does not exist!' });
        }
      } else if (req.body.products) {
        const finalProducts = await verifyProducts(req.body.products);
        const totalPrice = await calculatePrice(finalProducts);
        req.body.total_price = totalPrice;
        req.body.products = finalProducts;

        Order.findOneAndUpdate({ _id: orderId }, req.body, { new: true }, (error) => {
          if (error) next(error);
          else {
            let message;
            if (req.body.products) message = "Product's quantity successfully updated!";
            else if (req.body.sr_id) message = 'Order has been forwarded!';
            else if (req.body.state) message = `Order has been ${req.body.state}`;
            res.status(httpStatus.OK).json({ message });
          }
        });
      }
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Order does not exist' });
    }
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const result = await Order.findOneAndDelete({ _id: orderId });
      res.status(httpStatus.OK).json(result.deletedCount);
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Order does not exist' });
    }
  } catch (error) {
    next(error);
  }
};
