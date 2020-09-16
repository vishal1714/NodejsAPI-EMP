const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment-timezone');
//const autoIncrement = require('mongoose-auto-increment');
//const ConnectDB = require('../config/db');

//autoIncrement.initialize(ConnectDB);

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
  Zip: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Your Zip Code'],
  },
  Age: {
    type: Number,
    required: [true, 'Please Enter Your Employee Age'],
  },
  Department: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Your Department Name'],
  },
  Salary: {
    type: Number,
    required: [true, 'Please Enter Your Employee Salary PA'],
  },
  CreatedAt: {
    type: String,
    default: function () {
      return moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
    },
  },
});

EmployeeSchema.set('toJSON', {
<<<<<<< HEAD
  transform: function (doc, ret, options) {
    ret.EmpRefNo = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});
=======
     transform: function (doc, ret, options) {
         ret.EmpRefNo = ret._id;
         delete ret._id;
         delete ret.__v;
     }
}); 
>>>>>>> 79fb552554e635da232b1bec6030e88d2053df59

module.exports = mongoose.model('Employee', EmployeeSchema);
