const httpStatus = require('http-status');
const mongoose = require('mongoose');
const User = require('../models/user.model');

exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = { user };
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.get = (req, res) => res.json(req.locals.user.transform());

exports.loggedIn = (req, res) => res.json(req.user.transform());

exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

exports.update = (req, res, next) => {
  const user = Object.assign(req.locals.user, req.body);

  user
    .save()
    .then(savedUser => res.json(savedUser.transform()))
    .catch(e => next(User.checkDuplicateEmail(e)));
};

exports.list = async (req, res, next) => {
  try {
    const queryString = { ...req.query };
    const { page, perPage, ...options } = queryString;
    const users = await User.list(perPage, page, options);
    const transformedUsers = users.map(user => user.transform());
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const result = await User.findOneAndDelete({ _id: userId });
      res.status(httpStatus.OK).json(result.deletedCount);
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'User does not exist' });
    }
  } catch (error) {
    next(error);
  }
};
