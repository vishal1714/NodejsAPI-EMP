const APILog = require('../models/APILogSchema');
const APIUser = require('../models/APIUserSchema');
const UserEmail = require('../models/UserEmailSchema');
const moment = require('moment-timezone');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { ActivationEmail, WelcomeEmail, SendLogs } = require('./Email/SendMail');

dotenv.config({ path: './config/config.env' });

//@dec      Hash Function for converting sensitive user information to SHA hash
var Hash = (string) => {
  return crypto.createHash(process.env.HASH_ALGO).update(string).digest('hex');
};

//@dec      API Admin Time base Password Generator
var AdminPasswordGenerator = () => {
  var TimeBasePassword = moment().tz('Asia/Kolkata').format('DDMMYYYYhh');
  var pass = TimeBasePassword * 2;
  //console.log(pass);
  return pass.toString();
};

//@dec      Get API Logs
//@route    /api/admin/log
//@access   Private (Admin Only with API-KEY)
exports.GetAPIlog = async (req, res, next) => {
  try {
    const getapilog = await APILog.find().select('-__v');
    //Send Success Response
    res.status(200).json({
      Status: 'Success',
      Count: getapilog.length,
      Log: getapilog,
    });
  } catch (err) {
    console.log(err);
    //Send Error
    res.status(500).json({
      Error: {
        Status: 500,
        Message: 'Internal Server Error',
        Info: err,
      },
    });
  }
};

//@dec      Add API Client with Key
//@route    POST /api/admin/createuser
//@access   Private (Admin Only with API-KEY)
exports.AddUser = async (req, res) => {
  var reqKey = req.header('API-Admin-Key');
  var IP = req.header('X-Real-IP');
  var AdminAPIKey = [process.env.AdminAPIKey, AdminPasswordGenerator()];

  if (AdminAPIKey.includes(reqKey)) {
    try {
      const { Username, Email, Password } = req.body;
      if (Username == null || Email == null || Password == null) {
        //Send Error
        const Response = {
          Error: {
            Status: 400,
            Message: 'Some fields are not present in request body',
          },
        };
        //Send Response
        res.status(400).json(Response);
      } else {
        const addUserReq = {
          Username: Hash(Username),
          Email: Email,
          Password: Hash(Password),
        };
        const addUser = await APIUser.create(addUserReq);
        const User = await APIUser.findById(addUser._id)
          .select('-__v')
          .select('-APICalls')
          .select('-ActivationStatus')
          .select('-Username')
          .select('-Email')
          .select('-Password');
        ActivationEmail(Email, addUser._id, IP);
        res.status(200).json({
          Status: 'Successful',
          Data: User,
          Message: 'API user has been created',
        });
      }
    } catch (err) {
      //console.log(err);
      res.status(500).json({
        Error: {
          Status: 500,
          Message: 'Internal Server Error',
          Info: 'Username or Email Id is already registered',
        },
      });
    }
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        Status: 401,
        Message: 'Unauthorized ( Who are you Dude ?)',
      },
    });
  }
};

//@dec      Update API Client with Key
//@route    POST /api/admin/updateUser
//@access   Private (Admin Only with API-KEY)
exports.UpdateUser = async (req, res) => {
  var date = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
  var reqKey = req.header('API-Admin-Key');
  var AdminAPIKey = [process.env.AdminAPIKey, AdminPasswordGenerator()];

  if (AdminAPIKey.includes(reqKey)) {
    if (req.body.Username == null) {
      //Send Error
      const Response = {
        Error: {
          Status: 400,
          Message: 'UserName not present in request body',
        },
      };
      //Send Response
      res.status(400).json(Response);
    }

    const APIClientInfo = await APIUser.findOne({
      Username: Hash(req.body.Username),
      Password: Hash(req.body.Password),
    });
    if (APIClientInfo) {
      try {
        //Update Key Inf
        const updateKey = await APIUser.updateOne(
          {
            Username: Hash(req.body.Username),
            Password: Hash(req.body.Password),
          },
          {
            $set: {
              APISecretKey: req.body.APISecretKey,
              ModifiedAt: date,
            },
          }
        ).select('-__v');
        //console.log(updateKey)
        const Response = {
          Status: 'Success',
          Data: req.body,
          Message: 'Successfully! Key has been updated.',
        };
        res.status(200).json(Response);
      } catch (err) {
        var Response = {
          Error: {
            Status: 500,
            Message: 'Internal Server Error',
            Info: err,
          },
        };
        res.status(500).json(Response);
      }
    } else {
      const Responsefailed = {
        Status: 401,
        Message: 'Username or Password is not Valid!.',
      };
      res.status(401).json(Responsefailed);
    }
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        Status: 401,
        Message: 'Unauthorized',
      },
    });
  }
};

//@dec      Get API Client Status
//@route    /api/admin/apiStatus
//@access   Public
exports.UserStatus = async (req, res, next) => {
  try {
    const { Username, Password } = req.body;
    if (Username != undefined && Password != undefined) {
      const APIClientResponse = await APIUser.findOne({
        Username: Hash(Username),
        Password: Hash(Password),
      })
        .select('-Username')
        .select('-Password');
      if (APIClientResponse == null) {
        const Response = {
          Error: {
            Status: 404,
            Message: 'User Credentials are Incorrect or Not Found',
          },
        };
        res.status(404).json(Response);
      } else {
        const Response = {
          APIStatus: APIClientResponse,
        };
        res.status(200).json(Response);
      }
    } else {
      res.status(404).json({
        Error: {
          Status: 404,
          Message: 'Username or Password is missing',
        },
      });
    }
  } catch (err) {
    console.log(err);
    //Send Error
    res.status(500).json({
      Error: {
        Status: 500,
        Message: 'Internal Server Error',
        Info: err,
      },
    });
  }
};

//@dec      Get Account Activation link
//@route    /api/activation
//@access   Public
exports.AccountActivation = async (req, res, next) => {
  var IP = req.header('X-Real-IP');
  const Key = req.query.Key;
  const User = req.query.User;
  try {
    if (Key != null && User != null) {
      const APIClientValidation = await APIUser.findById(User).select('-__v');
      if (APIClientValidation == null) {
        res.status(400).json({
          Status: 400,
          Message: 'Key or User Query is Incorrect',
        });
      } else if (APIClientValidation.ActivationStatus === 0) {
        const UserEmailinfo = await UserEmail.findOneAndUpdate(
          { ActivationKey: Key, UserID: User },
          {
            $set: {
              ActivationStatus: 1,
            },
          },
          { new: true }
        );

        if (UserEmailinfo) {
          const APIUserInfo = await APIUser.findOneAndUpdate(
            { _id: User },
            {
              $set: {
                ActivationStatus: 1,
              },
            },
            { new: true }
          );
          res.status(200).json({
            Status: 'Successful',
            Message: 'Your Account is verified ',
          });
          console.log(IP);
          WelcomeEmail(UserEmailinfo.Email, APIUserInfo, IP);
        } else {
          res.status(404).json({
            Status: 404,
            Message: 'Account not found',
          });
        }
      } else {
        res.status(400).json({
          Status: 400,
          Message: 'Your Account is already Activated',
        });
      }
    } else {
      res.status(404).json({
        Status: 404,
        Message: 'Key or User Query is missing from URL',
      });
    }
  } catch (error) {
    res.status(500).json({
      Status: 500,
      Message: 'Internal Server Error',
      Info: error,
    });
  }
};

//@dec      Get Logs of specific Day on mail
//@route    /api/activation
//@access   Public
exports.EmailLogs = async (req, res) => {
  var reqKey = req.header('API-Admin-Key');
  var IP = req.header('X-Real-IP');
  const { Date, Email } = req.body;
  try {
    const IDD = await SendLogs(Date, Email);
    if (IDD) {
      res.status(200).json({
        Status: 'Successful',
        Message: `Log Report has been sent to Email ID - ${Email}`,
        RefNo: IDD,
      });
    } else {
      res.status(500).json({
        Status: 500,
        Message: `Something went wrong`,
      });
    }
  } catch (error) {
    res.status(500).json({
      Status: 500,
      Message: `Internal Server Error`,
      Info: error,
    });
  }
};
