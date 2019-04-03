const httpStatus = require('http-status');
const passport = require('passport');
const { Promise } = require('bluebird');
const User = require('../models/user.model');
const APIError = require('../utils/APIError');

const ADMIN = 'admin';
const USER = 'user';
const SALES = 'sales';

const handleJWT = (req, res, next, roles) => async (err, user, info) => {
  const error = err || info;
  // TODO: Remove blue-bird dependency
  const logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  try {
    if (error || !user) throw error;
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }

  if (!roles.includes(user.role)) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = 'Forbidden';
    return next(apiError);
  }
  if (err || !user) {
    return next(apiError);
  }

  req.user = user;

  return next();
};

const authorize = (roles = User.roles) => (req, res, next) => passport.authenticate('jwt', { session: false }, handleJWT(req, res, next, roles))(
  req,
  res,
  next,
);

module.exports = {
  authorize,
  ADMIN,
  USER,
  SALES,
};
