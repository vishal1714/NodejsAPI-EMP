const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment-timezone');
//const autoIncrement = require('mongoose-auto-increment');
//const ConnectDB = require('../config/db');

//autoIncrement.initialize(ConnectDB);

const EmployeeSchema = new mongoose.Schema({
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
    default: function() { return moment().tz('Asia/Kolkata').format("MMMM Do YYYY, hh:mm:ss A")},
  },
});

EmployeeSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})


//EmployeeSchema.plugin(autoIncrement.plugin, 'Employee');

module.exports = mongoose.model('Employee', EmployeeSchema);
