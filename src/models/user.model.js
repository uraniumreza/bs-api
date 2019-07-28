const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment');
const jwt = require('jwt-simple');
const httpStatus = require('http-status');
const autoIncrement = require('mongoose-auto-increment');
const { jwtSecret, jwtExpirationInterval } = require('../../config/vars');
const APIError = require('../utils/APIError');
const dbConfig = require('../../config/database.config');

const { uri } = dbConfig;
const connection = mongoose.createConnection(uri);
autoIncrement.initialize(connection);

const roles = ['user', 'admin', 'sales'];

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 128,
    },
    ownerName: {
      type: String,
      maxlength: 128,
      index: true,
      trim: true,
      required: true,
    },
    shopName: {
      type: String,
      maxlength: 128,
      trim: true,
      required: true,
    },
    address: {
      type: String,
      maxlength: 256,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
      required: true,
    },
    signedupBy: {
      type: String,
      maxlength: 11,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'shopName',
      'ownerName',
      'address',
      'phone',
      'createdAt',
      'role',
      'user_id',
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });
    return transformed;
  },

  token() {
    const payload = {
      exp: moment()
        .add(jwtExpirationInterval, 'minutes')
        .unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(payload, jwtSecret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

userSchema.statics = {
  roles,

  async get(id) {
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  async findAndGenerateToken(options) {
    const { phone, password, refreshObject } = options;
    if (!phone) throw new APIError({ message: 'A phone no. is required to generate a token' });

    const user = await this.findOne({ phone }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (password) {
      if (user && (await user.passwordMatches(password))) {
        return { user, accessToken: user.token() };
      }
      err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.userPhone === phone) {
      if (moment(refreshObject.expires).isBefore()) {
        err.message = 'Invalid refresh token.';
      } else {
        return { user, accessToken: user.token() };
      }
    } else {
      err.message = 'Incorrect phone or refreshToken';
    }
    throw new APIError(err);
  },

  list(perPage = 20, page = 1, options) {
    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [
          {
            field: 'email',
            location: 'body',
            messages: ['"email" already exists'],
          },
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },
};

userSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'user_id',
  startAt: 50000,
  incrementBy: 1,
});

module.exports = mongoose.model('User', userSchema);
