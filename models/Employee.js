const mongoose = require('mongoose');
const uuid = require('uuid');

const EmployeeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  Fname: {
    type: String,
    trim: true,
    required: [true, 'Please Enter First Name'],
  },
  Lname: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Last Name'],
  },
  Age: {
    type: Number,
    required: [true, 'Please Enter Employee Age'],
  },
  Depname: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Department Name'],
  },
  Salary: {
    type: Number,
    required: [true, 'Please Enter Employee Salary PA'],
  },
  CreatedAt: {
    type: Date,
    default: Date.now(),
  },
  __v: { type: Number, versionKey: false },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
