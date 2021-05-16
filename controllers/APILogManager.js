const fs = require("fs");
const moment = require("moment");
const dotenv = require("dotenv");
const { createGzip } = require("zlib");
const { pipeline } = require("stream");
const { createReadStream, createWriteStream } = require("fs");
const { promisify } = require("util");
const { createCipheriv, createDecipheriv } = require("crypto");

const EmployeeAPILog = require("../models/APILogSchema");
const { SendMQ } = require("./APIMQ");

const pipe = promisify(pipeline);
dotenv.config({ path: "./config/config.env" });

// ! Log Add Delete Update Employee Requests and Response in MongoDB and LocalSystem
const Log = (req, Response, IP, reqKey, reqmethod, key) => {
  if (process.env.LOG_MODE != "OFF") {
    try {
      var LogDate = moment()
        .tz("Asia/Kolkata")
        .format("MMMM Do YYYY, hh:mm:ss A");
      var FileDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
      const reqBoday = (req) => {
        if (req.params.id) {
          const id = { _id: req.params.id };
          return id;
        } else {
          return req.body;
        }
      };
      const ReqResLogLocal = {
        ReqBody: reqBoday(req),
        //ReqHeaders: req.headers,
        ResBody: Response,
        Method: reqmethod,
        APIClientID: reqKey,
        ClientIP: IP,
        LoggedAt: LogDate,
      };

      if (process.env.LOG_MODE == "Cloud" || process.env.LOG_MODE == "ALL") {
        const ReqResLogCloud = {
          ReqBody: reqBoday(req),
          //ReqHeaders: req.headers,
          //EncKey: key,
          ResBody: Response,
          Method: reqmethod,
          APIClientID: reqKey,
          ClientIP: IP,
          LoggedAt: LogDate,
        };
        // ? Log API request in MongoDB Database -> apilogs
        //EmployeeAPILog.create(ReqResLogCloud);
        SendMQ("APILog", ReqResLogCloud);
      }

      if (process.env.LOG_MODE == "Internal" || process.env.LOG_MODE == "ALL") {
        //console.log(ReqRes);
        var LogedinDB = JSON.stringify(ReqResLogLocal);
        //console.log('Log' + LogedinDB);
        var LogData = "|" + LogDate + "| Source - API |" + LogedinDB;

        let filename = process.env.LOG_FILE + "-" + FileDate + ".log";
        // var logStream = fs.createWriteStream(filename, { flags: 'a' });
        // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
        // logStream.write(LogData + '\n');

        fs.appendFile(filename, LogData + "\n", function (err) {
          if (err) throw err;
        });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    //Pass
  }
};

// ! Create Log Dir if it is not exist
function CreatePath(filePath) {
  if (fs.existsSync(filePath)) {
  } else {
    fs.mkdirSync(filePath);
  }
}

// ! Gzip File Function
const dogzip = async (input, output) => {
  try {
    const gzip = createGzip();
    /*const Enc = createCipheriv(
      'aes-256-cbc',
      process.env.AdminAESKey,
      process.env.AdminIV
    );*/
    const source = createReadStream(input);
    const destination = createWriteStream(output);
    await pipe(source, gzip, destination);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

module.exports = { Log, CreatePath, dogzip };
