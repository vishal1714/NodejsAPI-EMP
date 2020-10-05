const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment-timezone');

const AdminSchema = new mongoose.Schema({
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
    default: uuid.v4,
  },
  APISecretKey: {
    type: String,
    index: { unique: true },
    default: uuid.v4,
  },
  APICalls: {
    type: Number,
    default: 0,
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

AdminSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.UserRefNo = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('APIAdmin', AdminSchema);
