const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const dbConfig = require('../../config/database.config');

const { uri } = dbConfig;
const connection = mongoose.createConnection(uri);
autoIncrement.initialize(connection);

const productSchema = mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    brand: {
      type: String,
      default: 'BS Trading',
      maxlength: 64,
    },
    category: {
      type: String,
      enum: ['Cosmetics', 'Electronics', 'Accessories'],
      required: true,
      index: true,
    },
    color: {
      type: String,
      maxlength: 32,
    },
    size: {
      type: String,
      maxlength: 64,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: undefined,
      required: true,
    },
    description: {
      type: String,
      maxlength: 1500,
    },
    stock_count: {
      type: Number,
      min: [0, 'Out of Stock'],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.method({
  transformList() {
    const transformed = {};
    const fields = [
      'id',
      'name',
      'image',
      'price',
      'discount',
      'stock_count',
      'brand',
      'product_id',
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

productSchema.statics = {
  list(options) {
    return this.find(options)
      .sort({ createdAt: -1 })
      .exec();
  },
};

productSchema.plugin(autoIncrement.plugin, {
  model: 'Product',
  field: 'product_id',
  startAt: 1000,
  incrementBy: 1,
});

module.exports = mongoose.model('Product', productSchema);
