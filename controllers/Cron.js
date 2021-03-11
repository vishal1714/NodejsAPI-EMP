const cron = require('node-cron');
var fs = require('fs');
const dotenv = require('dotenv');
const moment = require('moment-timezone');
const path = require('path');
dotenv.config({ path: '../config/Config.env' });

// Imports for Cron
const EmployeeAPILog = require('../models/APILogSchema');
const { ReceiverMQ } = require('./APIMQ');
const { dogzip } = require('./APILogManager');

cron.schedule('59 */23 * * *', function () {
  //59 */23 * * *
  var date = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
  console.log(`--------------------- Cron Job Running --------------------`);
  console.log(`Date & Time - ${date} `);
  //1.
  ReceiverMQ('APILog', EmployeeAPILog);
  //2.
  LogGZIP();
  console.log(`------ Finish ------`);
});

const LogGZIP = async () => {
  var FileDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
  let LogFileName = `APILog-${FileDate}.log`;
  let ZipLogFileName = `APILog-${FileDate}.log.gz`;
  let inputFile = path.join(
    __dirname,
    `../${process.env.LOG_DIR}/`,
    LogFileName
  );
  let outputFile = path.join(
    __dirname,
    `../${process.env.LOG_DIR}/`,
    ZipLogFileName
  );

  if (fs.existsSync(inputFile)) {
    await dogzip(inputFile, outputFile).then(fs.unlinkSync(inputFile));
    console.log('GZIP is done');
  }
};

module.exports = { LogGZIP };
