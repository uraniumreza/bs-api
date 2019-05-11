const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const dbConfig = require('../../config/database.config');
const Product = require('./product.model');
const User = require('./user.model');

const { uri } = dbConfig;
const connection = mongoose.createConnection(uri);
autoIncrement.initialize(connection);

const { ObjectId } = mongoose.Schema.Types;

const orderSchema = mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    products: {
      type: [
        {
          product_id: { type: ObjectId, required: true },
          final_quantity: { type: Number, required: true },
          ordered_quantity: { type: Number, required: true },
        },
      ],
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    sr_id: {
      type: ObjectId,
      default: undefined,
      index: true,
    },
    user_id: {
      type: ObjectId,
      required: true,
      index: true,
    },
    state: {
      type: String,
      enum: ['Pending', 'Processing', 'Delivered', 'Canceled'],
      default: 'Pending',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.method({
  async transformUser(userId) {
    const user = await User.findById(userId, {
      phone: 1,
      shopName: 1,
      ownerName: 1,
      address: 1,
      _id: 0,
    });

    return user;
  },

  async transformProducts(products) {
    const productIds = [];
    products.forEach(product => productIds.push(mongoose.Types.ObjectId(product.product_id)));

    const newProducts = await Product.find(
      {
        _id: {
          $in: productIds,
        },
      },
      {
        image: 1,
        name: 1,
        price: 1,
        stock_count: 1,
        _id: 0,
      },
    );

    const transformedProducts = [];
    newProducts.map((newProduct, index) => {
      const { _id, ...product } = products[index].toObject();
      transformedProducts.push({ ...newProduct.toObject(), ...product });
    });

    return transformedProducts;
  },

  async transformOrder() {
    const transformed = {};
    const fields = [
      'id',
      'createdAt',
      'order_id',
      'user_id',
      'products',
      'total_price',
      'sr_id',
      'state',
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    const transformedProducts = await this.transformProducts(transformed.products);
    const transformedUser = await this.transformUser(transformed.user_id);
    return { ...transformed, products: transformedProducts, user: transformedUser };
  },
});

orderSchema.statics = {
  list(options) {
    return this.find(options)
      .sort({ createdAt: -1 })
      .exec();
  },
  get(id) {
    return this.findById(id).exec();
  },
};

orderSchema.plugin(autoIncrement.plugin, {
  model: 'Order',
  field: 'order_id',
  startAt: 201900000,
  incrementBy: 1,
});

module.exports = mongoose.model('Order', orderSchema);
