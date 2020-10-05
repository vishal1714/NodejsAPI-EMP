const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment-timezone');

const APISchemaLog = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  EncKey: {
    type: 'String',
  },
  Method: {
    type: 'String',
  },
  APIClientID: {
    type: 'String',
  },
  ReqPath: {
    _id: {
      type: 'String',
    },
  },
  ReqBody: {
    Refno: {
      type: 'String',
    },
    encryptedData: {
      type: 'String',
    },
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
      type: 'String',
    },
    Salary: {
      type: 'String',
    },
    PhoneNo: {
      type: 'String',
    },
  },
  ResBody: {
    Error: {
      message: {
        type: 'String',
      },
      Info: {
        type: 'String',
      },
    },
    Refno: {
      type: 'String',
    },
    encryptedData: {
      type: 'String',
    },
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
        type: 'String',
      },
      Salary: {
        type: 'String',
      },
      PhoneNo: {
        type: 'String',
      },
      _id: {
        type: 'String',
      },
      CreatedAt: {
        type: 'String',
      },
      ModifiedAt: {
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
  ClientIP: {
    type: 'String',
  },
});

APISchemaLog.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.RajeRefNo = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});
module.exports = mongoose.model('APILog', APISchemaLog);
