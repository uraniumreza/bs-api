const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: undefined,
    },
    featured: {
      type: Boolean,
      default: false,
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

notificationSchema.statics = {
  list(options) {
    return this.find(options)
      .sort({ createdAt: -1 })
      .exec();
  },
};

module.exports = mongoose.model('Notification', notificationSchema);
