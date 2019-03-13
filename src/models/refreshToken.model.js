const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userPhone: {
    type: 'String',
    ref: 'User',
    required: true,
  },
  expires: { type: Date },
});

refreshTokenSchema.statics = {
  generate(user) {
    const userId = user._id;
    const userPhone = user.phone;
    const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = moment()
      .add(30, 'days')
      .toDate();
    const tokenObject = new RefreshToken({
      token,
      userId,
      userPhone,
      expires,
    });
    tokenObject.save();
    return tokenObject;
  },
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;
