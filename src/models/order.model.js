const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const dbConfig = require('../../config/database.config');

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
    sr: {
      type: ObjectId,
      default: undefined,
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
  transformList() {
    const transformed = {};
    const fields = ['order_id', 'products', 'price', 'sr', 'state'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

orderSchema.statics = {
  list(options) {
    return this.find(options)
      .sort({ createdAt: -1 })
      .exec();
  },
};

orderSchema.plugin(autoIncrement.plugin, {
  model: 'Order',
  field: 'order_id',
  startAt: 201900000,
  incrementBy: 1,
});

module.exports = mongoose.model('Order', orderSchema);
