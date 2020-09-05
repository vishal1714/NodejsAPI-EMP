var fs = require('fs');
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
const EmployeeAPILog = require('../models/APISchemaLog');

const Log = async (req, Response, IP, reqKey, reqmethod) => {
  try {
    var m = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
    if (!req.params.id) {
      var reqbody = req.body;
    } else {
      var reqpara = { _id: req.params.id };
    }

    const ReqRes = {
      Method: reqmethod,
      APIKey: reqKey,
      reqBody: reqbody,
      reqPath: reqpara,
      resBody: Response,
      ClientIP: IP,
      LoggedAt: m,
    };
    var LogedinDB = JSON.stringify(ReqRes);
    var LogData = '|' + m + '|' + LogedinDB;

    fs.appendFile(process.env.LOGDIR, LogData = "\n", function (err) {
      if (err) throw err;
      //console.log('Loged!' + LogData);
    });
    await EmployeeAPILog.create(ReqRes);
  } catch (error) {
    console.log(error);
  }
};

module.exports = Log;
