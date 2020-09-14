const APILog = require('../models/APISchemaLog');
const APIAdmin = require('../models/APISchemaAdmin');
var fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

exports.GetEmployeelog = async (req, res, next) => {
  try {
    const getemployeelog = await APILog.find().select('-__v');
    //Send Success Response
    res.status(200).json({
      Status: 'Success',
      Count: getemployeelog.length,
      Log: getemployeelog,
    });
  } catch (err) {
    console.log(err);
    //Send Error
    res.status(500).json({
      Error: {
        message: 'Internal Server Error',
        info: err,
      },
    });
  }
};

exports.AddKey = async (req, res) => {
  try {
    const { Username, APIKey } = req.body;
    const addKey = await APIAdmin.create(req.body);
    res.status(200).json({
      Status: 'Successful',
      Data: addKey,
      Message: 'API Key has been Added',
    });
  } catch (err) {
    console.log(err);

    if (err.name == 'MongoError') {
      const messages = Object.values(err.keyValue);
      const Response = {
        Error: {
          message: messages + ' is not Unique',
        },
      };
      res.status(400).json(Response);
    } else {
      res.status(500).json({
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      });
    }
  }
};

exports.UpdateKey = async (req, res) => {
  try {
    if (req.body.Username == null) {
      //Send Error
      const Response = {
        Error: {
          message: 'UserName not present in request body',
        },
      };
      //Send Response
      res.status(400).json(Response);
    }
    //Update Key Info
    const updateKey = await APIAdmin.findOneAndUpdate(
      { Username: req.body.Username },
      {
        $set: {
          Username: req.body.Username,
          APIKey: req.body.APIKey,
        },
      }
    ).select('-__v');
    if (!updateKey) {
      const Responsefailed = {
        Status: 'Failed',
        Message: 'Useername is not presnet!.',
      };
      res.status(400).json(Responsefailed);
    } else {
      const Response = {
        Status: 'Success',
        Data: req.body,
        Message: 'Successfully! Key has been updated.',
      };
      res.status(200).json(Response);
    }
  } catch (err) {
    var Response = {
      Error: {
        message: 'Internal Server Error',
        info: err,
      },
    };
    res.status(500).json(Response);
  }
};
