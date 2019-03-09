const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
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
    colors: {
      type: [String],
      default: undefined,
    },
    sizes: {
      type: [String],
      default: undefined,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
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
    const fields = ['id', 'name', 'price', 'discount', 'stock_count', 'active'];

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

module.exports = mongoose.model('Product', productSchema);
