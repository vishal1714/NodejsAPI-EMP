const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment-timezone');

const APISchemaLog = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  Method: {
    type: 'String',
  },
  reqBody: {
    _id: {
      type: 'String',
    },
    Name: {
      type: 'String',
    },
    Department: {
      type: 'String',
    },
    Age: {
      type: 'Number',
    },
    Salary: {
      type: 'Number',
    },
    Zip: {
      type: 'String',
    },
  },
  resBody: {
    Status: {
      type: 'String',
    },
    Data: {
      Name: {
        type: 'String',
      },
      Department: {
        type: 'String',
      },
      Age: {
        type: 'Number',
      },
      Salary: {
        type: 'Number',
      },
      Zip: {
        type: 'String',
      },
      _id: {
        type: 'String',
      },
      CreatedAt: {
        type: 'String',
      },
      __v: {
        type: 'Number',
      },
    },
    Message: {
      type: 'String',
    },
  },
  loggedAt: {
    type: 'String',
    default: function () {
      return moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
    },
  },
});

//EmployeeSchema.plugin(autoIncrement.plugin, 'Employee');

module.exports = mongoose.model('APILog', APISchemaLog);
