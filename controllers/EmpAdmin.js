const APILog = require('../models/APILogSchema');
const APIAdmin = require('../models/APIAdminSchema');
var fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const AdminAPIKey = process.env.AdminAPIKey;

//@dec      Get API Logs
//@route    /apiadmin/log
//@access   Private (Admin Only with API-KEY)
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

//@dec      Add API Client with Key
//@route    POST /apiadmin/createKey
//@access   Private (Admin Only with API-KEY)
exports.AddKey = async (req, res) => {
  var reqKey = req.header('API-Admin-Key');
  var IP = req.header('X-Real-IP');

  if (reqKey == AdminAPIKey) {
    try {
      const { Username, Email, Password } = req.body;
      const addKey = await APIAdmin.create(req.body);
      res.status(200).json({
        Status: 'Successful',
        Data: addKey,
        Message: 'API Key has been Added',
      });
    } catch (err) {
      //console.log(err);
      res.status(500).json({
        Error: {
          message: 'Internal Server Error',
          info: err.message,
        },
      });
    }
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        message: 'Unauthorized',
      },
    });
  }
};

//@dec      Update API Client with Key
//@route    POST /apiadmin/updateKey
//@access   Private (Admin Only with API-KEY)
exports.UpdateKey = async (req, res) => {
  var reqKey = req.header('API-Admin-Key');
  var IP = req.header('X-Real-IP');

  if (reqKey == AdminAPIKey) {
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
        { Username: req.body.Username, Password: req.body.Password },
        {
          $set: {
            Username: req.body.Username,
            APIClientID: req.body.APIClientID,
            APISecretKey: req.body.APISecretKey,
            Password: req.body.Password,
          },
        }
      ).select('-__v');
      if (!updateKey) {
        const Responsefailed = {
          Status: 'Failed',
          Message: 'Username or Password is not Valid!.',
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
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        message: 'Unauthorized',
      },
    });
  }
};
