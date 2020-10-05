const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment-timezone');

const EmployeeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  Name: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Your Name'],
  },
  PhoneNo: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Your Phone No'],
  },
  Age: {
    type: String,
    required: [true, 'Please Enter Your Employee Age'],
  },
  Department: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Your Department Name'],
  },
  Salary: {
    type: String,
    required: [true, 'Please Enter Your Employee Salary PA'],
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

EmployeeSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.EmpRefNo = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
