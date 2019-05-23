const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Notification = require('../models/notification.model');

exports.list = async (req, res, next) => {
  try {
    let options = { ...req.query };
    if (req.user.role === 'user') options = { ...options, active: true };
    let notifications = await Notification.list(options);
    if (req.user.role === 'user' && req.query.featured === true) notifications = notifications.filter(notification => notification.image);
    res.status(httpStatus.OK).json(notifications);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const notification = new Notification(req.body);
    const savedNotification = await notification.save();
    res.status(httpStatus.CREATED).json(savedNotification);
  } catch (error) {
    next(error);
  }
};

exports.update = (req, res, next) => {
  try {
    const { notificationId } = req.params;
    if (mongoose.Types.ObjectId.isValid(notificationId)) {
      Notification.findOneAndUpdate(
        { _id: notificationId },
        req.body,
        { new: true },
        (error, updatedNotification) => {
          if (error) next(error);
          else res.status(httpStatus.OK).json(updatedNotification);
        },
      );
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Notification does not exist' });
    }
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    if (mongoose.Types.ObjectId.isValid(notificationId)) {
      const result = await Notification.findOneAndDelete({ _id: notificationId });
      res.status(httpStatus.OK).json(result.deletedCount);
    } else {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Notification does not exist' });
    }
  } catch (error) {
    next(error);
  }
};
