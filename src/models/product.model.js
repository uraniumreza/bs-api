const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: String,
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
  price: Number,
  discount: Number,
  images: {
    type: [String],
    default: undefined,
  },
  description: String,
  stock_count: {
    type: Number,
    min: [0, 'Out of Stock'],
  },
  active: Boolean,
});

module.exports = mongoose.model('Product', productSchema);
