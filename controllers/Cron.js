const cron = require("node-cron");
var fs = require("fs");
const dotenv = require("dotenv");
const moment = require("moment-timezone");
const path = require("path");
const { CreatePath } = require("./APILogManager");
dotenv.config({ path: "../config/Config.env" });

// Imports for Cron
const EmployeeAPILog = require("../models/APILogSchema");
const { ReceiverMQ } = require("./APIMQ");
const { dogzip } = require("./APILogManager");

cron.schedule("0 3 * * *", function () {
  //59 */23 * * *
  var Currentdate = moment()
    .tz("Asia/Kolkata")
    .format("MMMM Do YYYY, hh:mm:ss A");
  console.log(`--------------------- Cron Job Running --------------------`);
  console.log(`Date & Time - ${Currentdate} `);
  //1.
  //ReceiverMQ('APILogDB', EmployeeAPILog);
  //2.
  console.log(`GZIP process is started`);
  LogGZIP();
  console.log(`------ Finish ------`);
});

const LogGZIP = async () => {
  let yesterday = moment().add(-1, "days");
  CreatePath(process.env.ZIP_LOG_DIR);
  var FileDate = yesterday.tz("Asia/Kolkata").format("YYYY-MM-DD");
  var ZipFileDate = yesterday.tz("Asia/Kolkata").format("YYYY-MM-DD");
  let LogFileName = `APILog-${FileDate}.log`;
  let ZipLogFileName = `APILog-${ZipFileDate}.log.gz`;
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
    console.log(`GZIP is done -> ${ZipLogFileName}`);
  }
};

module.exports = { LogGZIP };
