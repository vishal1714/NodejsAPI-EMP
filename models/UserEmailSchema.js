const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment-timezone');

const UserEmailSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  Email: {
    type: String
  },
  UserID: {
    type: String,
  },
  ActivationKey: {
    type: String,
    index: { unique: true },
  },
  ActivationMailId: {
    type: String,
  },
  ActivationStatus: {
    type: Number,
    default: 0,
  },
  WelcomeMailId: {
    type: String,
  },
  Error: {
    
  },
  CreatedAt: {
    type: String,
    default: function () {
      return moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
    },
  },
  ModifiedAt: {
    type: String,
    default: function () {
      return moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
    },
  },
});

UserEmailSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.EmailRefNo = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('UserEmail', UserEmailSchema);
