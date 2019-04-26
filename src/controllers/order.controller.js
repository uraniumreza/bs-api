const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

// exports.list = async (req, res, next) => {
//   try {
//     let options = { ...req.query };
//     if (req.user.role === 'user') options = { ...options, active: true };
//     const products = await Product.list(options);
//     const transformedProducts = products.map(product => product.transformList());
//     res.status(httpStatus.OK).json(transformedProducts);
//   } catch (error) {
//     next(error);
//   }
// };

const verifyProducts = async (products) => {
  const productIds = [];
  await products.forEach(product => productIds.push(mongoose.Types.ObjectId(product.product_id)));

  // Retrieve price, stock_count of corresponding the product_ids
  const newProducts = await Product.find(
    {
      _id: {
        $in: productIds,
      },
    },
    {
      price: 1,
      stock_count: 1,
    },
  );

  const finalProducts = newProducts.map((product, index) => {
    const { ordered_quantity: quantity } = products[index];
    const dbProduct = product.toObject();
    const newProduct = {
      product_id: dbProduct._id,
      ordered_quantity: quantity,
      final_quantity: undefined,
      price: dbProduct.price,
    };

    if (dbProduct.stock_count === 0) newProduct.final_quantity = 0;
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

// exports.get = async (req, res, next) => {
//   try {
//     const { productId } = req.params;
//     if (mongoose.Types.ObjectId.isValid(productId)) {
//       const product = await Product.findById(productId).exec();
//       res.status(httpStatus.OK).json(product);
//     } else {
//       res.status(httpStatus.NOT_FOUND).json({ message: 'Product does not exist' });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// exports.update = (req, res, next) => {
//   try {
//     const { productId } = req.params;
//     if (mongoose.Types.ObjectId.isValid(productId)) {
//       Product.findOneAndUpdate(
//         { _id: productId },
//         req.body,
//         { new: true },
//         (error, updatedProduct) => {
//           if (error) next(error);
//           else res.status(httpStatus.OK).json(updatedProduct);
//         },
//       );
//     } else {
//       res.status(httpStatus.NOT_FOUND).json({ message: 'Product does not exist' });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// exports.remove = async (req, res, next) => {
//   try {
//     const { productId } = req.params;
//     if (mongoose.Types.ObjectId.isValid(productId)) {
//       const result = await Product.findOneAndDelete({ _id: productId });
//       res.status(httpStatus.OK).json(result.deletedCount);
//     } else {
//       res.status(httpStatus.NOT_FOUND).json({ message: 'Product does not exist' });
//     }
//   } catch (error) {
//     next(error);
//   }
// };
