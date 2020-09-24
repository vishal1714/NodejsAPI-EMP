var fs = require('fs');
var path = require('path');
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
const EmployeeAPILog = require('../models/APILogSchema');

const Log = (req, Response, IP, reqKey, reqmethod) => {
  try {
    var m = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
    if (!req.params.id) {
      var reqbody = req.body;
    } else {
      var reqpara = { _id: req.params.id };
    }
    const ReqRes = {
      ReqBody: reqbody,
      ReqPath: reqpara,
      ResBody: Response,
      Method: reqmethod,
      APIKey: reqKey,
      ClientIP: IP,
      LoggedAt: m,
    };

    var LogedinDB = JSON.stringify(ReqRes);
    var LogData = '|' + m + '|' + LogedinDB;

    fs.appendFile(process.env.LOGFILE, LogData + '\n', function (err) {
      if (err) throw err;
      //console.log('Loged!' + LogData);
    });
    EmployeeAPILog.create(ReqRes);
  } catch (error) {
    console.log(error);
  }
};

function CreatePath(filePath) {
  if (fs.existsSync(filePath)) {
  } else {
    fs.mkdirSync(filePath);
  }
}

module.exports = { Log, CreatePath };
