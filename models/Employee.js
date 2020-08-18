const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment');

const EmployeeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  Name: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Name'],
  },
  DOB: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Date Of Birth'],
  },
  Age: {
    type: Number,
    required: [true, 'Please Enter Employee Age'],
  },
  Department: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Department Name'],
  },
  Salary: {
    type: Number,
    required: [true, 'Please Enter Employee Salary PA'],
  },
  CreatedAt: {
    type: String,
    default: function() {return moment().format("MMMM Do YYYY, hh:mm:ss A")},
  },
  __v: { type: Number, versionKey: false },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
