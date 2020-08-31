var fs = require('fs');
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
const EmployeeAPILog = require('../models/APISchemaLog');

const Log = async (data) => {
  try {
    var m = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
    var LogedinDB = JSON.stringify(data);
    var LogData = '|' + m + '|' + LogedinDB;

    fs.appendFile('./APILog/APILog.log', LogData, function (err) {
      if (err) throw err;
      //console.log('Loged!' + LogData);
    });
    await EmployeeAPILog.create(data);
  } catch (error) {
    console.log(error);
  }
};

module.exports = Log;
