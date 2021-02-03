const mongoose = require('mongoose');
const uuid = require('uuid');
const RandomString = require('randomstring');
const moment = require('moment-timezone');

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  Username: {
    type: String,
    index: { unique: true },
    required: [true, 'Please Enter Your UserName'],
  },
  Password: {
    type: String,
    required: [true, 'Please Enter Your Password'],
  },
  Email: {
    type: String,
    index: { unique: true },
    required: [true, 'Please Enter Your Email ID'],
  },
  APIClientID: {
    type: String,
    index: { unique: true },
    minlength: 10,
    maxlength: 40,
    default: uuid.v4,
  },
  APISecretKey: {
    type: String,
    index: { unique: true },
    minlength: 10,
    maxlength: 40,
    default: function () {
      return RandomString.generate({
        length: 36,
      });
    },
  },
  AESKey: {
    type: String,
    index: { unique: true },
    minlength: 32,
    maxlength: 32,
    default: function () {
      return RandomString.generate({
        length: 32,
      });
    },
  },
  APICalls: {
    type: Number,
    default: 0,
  },
  ActivationStatus: {
    type: Number,
    default: 0,
  },
  APICallLimit: {
    type: Number,
    default: 1000,
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

UserSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.UserRefNo = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('APIUser', UserSchema);
