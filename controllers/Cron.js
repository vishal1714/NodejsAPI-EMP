const cron = require('node-cron');
var fs = require('fs');
const dotenv = require('dotenv');
const moment = require('moment-timezone');
const path = require('path');
const { CreatePath } = require('./APILogManager');
dotenv.config({ path: '../config/Config.env' });

// Imports for Cron
const EmployeeAPILog = require('../models/APILogSchema');
const { ReceiverMQ } = require('./APIMQ');
const { dogzip } = require('./APILogManager');

cron.schedule('59 */23 * * *git ', function () {
  //59 */23 * * *
  var date = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
  console.log(`--------------------- Cron Job Running --------------------`);
  console.log(`Date & Time - ${date} `);
  //1.
  //ReceiverMQ('APILogDB', EmployeeAPILog);
  //2.
  LogGZIP();
  console.log(`------ Finish ------`);
});

const LogGZIP = async () => {
  CreatePath(process.env.ZIP_LOG_DIR);
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
    `../${process.env.ZIP_LOG_DIR}/`,
    ZipLogFileName
  );

  if (fs.existsSync(inputFile)) {
    await dogzip(inputFile, outputFile).then(await fs.unlinkSync(inputFile));
    console.log('GZIP is done');
  }
};

module.exports = { LogGZIP };
