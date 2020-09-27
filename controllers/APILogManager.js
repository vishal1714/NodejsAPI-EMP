var fs = require('fs');
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
const EmployeeAPILog = require('../models/APILogSchema');

// ! Log Add Delete Update Employee Requests and Response
const Log = (req, Response, IP, reqKey, reqmethod, key) => {
  try {
    var LogDate = moment()
      .tz('Asia/Kolkata')
      .format('MMMM Do YYYY, hh:mm:ss A');
    var FileDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const ReqRes = {
      ReqBody: req,
      EncKey: key,
      ResBody: Response,
      Method: reqmethod,
      APIKey: reqKey,
      ClientIP: IP,
      LoggedAt: LogDate,
    };

    // ? Log API request in MongoDB Databse -> apilogs
    EmployeeAPILog.create(ReqRes);
    //console.log(ReqRes);
    var LogedinDB = JSON.stringify(ReqRes);
    //console.log('Log' + LogedinDB);
    var LogData = '|' + LogDate + '|' + LogedinDB;

    let filename = process.env.LOGFILE + '-' + FileDate + '.log';

    fs.appendFile(filename, LogData + '\n', function (err) {
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
