var fs = require('fs');
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
const EmployeeAPILog = require('../models/APILogSchema');

// ! Log Add Delete Update Employee Requests and Response
const Log = (req, Response, IP, reqKey, reqmethod, key) => {
  try {
    var m = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
    const ReqRes = {
      ReqBody: req,
      EncKey: key,
      ResBody: Response,
      Method: reqmethod,
      APIKey: reqKey,
      ClientIP: IP,
      LoggedAt: m,
    };

    // ? Log API request in MongoDB Databse -> apilogs
    EmployeeAPILog.create(ReqRes);
    //console.log(ReqRes);
    var LogedinDB = JSON.stringify(ReqRes);
    //console.log('Log' + LogedinDB);
    var LogData = '|' + m + '|' + LogedinDB;

    fs.appendFile(process.env.LOGFILE, LogData + '\n', function (err) {
      if (err) throw err;
    });
  } catch (error) {
    console.log(error);
  }
};

// ! Create Log Dir if it is not exist
function CreatePath(filePath) {
  if (fs.existsSync(filePath)) {
  } else {
    fs.mkdirSync(filePath);
  }
}

module.exports = { Log, CreatePath };
