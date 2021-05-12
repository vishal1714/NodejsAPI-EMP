const Employee = require("../models/EmployeeSchema");
const APIUser = require("../models/APIUserSchema");
const crypto = require("crypto");
const { Log } = require("./APILogManager");
const moment = require("moment-timezone");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const algorithm = "aes-256-cbc";

/*  Functions  */
//! Encrypt Function
const encrypt = (text1, apikey) => {
  const key = apikey;
  const iv = crypto.randomBytes(16);
  let text = JSON.stringify(text1);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const Response = {
    EncData: iv.toString("hex") + encrypted.toString("hex"),
  };
  return Response;
};

//! Decrypt Function
const decrypt = (req, apikey) => {
  const key = apikey;
  const { EncData } = req;
  //console.log(key);
  const Refno = EncData.slice(0, 32);
  const Data = EncData.slice(32);
  let iv = Buffer.from(Refno, "hex");
  let encryptedText = Buffer.from(Data, "hex");
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

//@dec      Get Encrypted Employee using Employee ID
//@route    GET /api/v2/employee/:id
//@access   Private (AES-Key for Encryption/Decryption)
exports.SecGetEmployeeByID = async (req, res, next) => {
  var IP = req.header("X-Real-IP");
  const reqbody = {
    _id: req.params.id,
  };
  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header("API-Client-ID"),
    APISecretKey: req.header("API-Secret-Key"),
  });
  //console.log(APIClientInfo);
  if (APIClientInfo && APIClientInfo.ActivationStatus === 1) {
    try {
      const getemployeebyid = await Employee.findById(req.params.id).select(
        "-__v"
      );

      //if Employee ID not found in DB
      if (!getemployeebyid) {
        const Response = {
          Error: {
            Status: 404,
            Message: "Employee not found",
          },
        };
        res.status(404).json(Response);
        Log(
          req,
          Response,
          IP,
          APIClientInfo.APIClientID,
          "Get Employee",
          APIClientInfo.AESKey
        );
      } else {
        //Send Success Response
        const Response = {
          Status: "Success",
          Data: getemployeebyid,
          Message: "Successfully! Record has been fetched.",
        };
        const inc = encrypt(Response, APIClientInfo.AESKey);
        res.status(200).json(inc);
        Log(
          req,
          inc,
          IP,
          APIClientInfo.APIClientID,
          "Get Employee",
          APIClientInfo.AESKey
        );
      }
    } catch (err) {
      const Response = {
        Error: {
          Status: 500,
          Message: "Internal Server Error",
          Info: err,
        },
      };
      //Send Error
      res.status(500).json(Response);
      Log(
        req,
        Response,
        IP,
        APIClientInfo.APIClientID,
        "Get Employee",
        APIClientInfo.AESKey
      );
    }
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        Status: 401,
        Message: "Unauthorized",
      },
    });
  }
};

//@dec      Add Encrypted Employee
//@route    POST /api/v2/employee/add
//@access   Private (Client API Key and AES-Key for Encryption/Decryption)
exports.SecAddEmployee = async (req, res, next) => {
  var IP = req.header("X-Real-IP");
  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header("API-Client-ID"),
    APISecretKey: req.header("API-Secret-Key"),
  });
  //console.log(APIClientInfo);
  if (
    APIClientInfo &&
    APIClientInfo.APICallLimit != APIClientInfo.APICalls &&
    APIClientInfo.APICallLimit >= APIClientInfo.APICalls &&
    APIClientInfo.ActivationStatus === 1
  ) {
    try {
      // Decrypt Encrypted Request
      const dec = decrypt(req.body, APIClientInfo.AESKey);
      //console.log(dec)
      const { Name, PhoneNo, Age, Department, Salary } = dec;
      if (
        Name == null ||
        PhoneNo == null ||
        Age == null ||
        Department == null ||
        Salary == null
      ) {
        //Send Error
        const Response = {
          Error: {
            Status: 400,
            Message: "Some fields are not present in encrypted request body",
          },
        };
        //Send Response
        res.status(400).json(Response);
        //Log
        Log(
          req,
          Response,
          IP,
          APIClientInfo.APIClientID,
          "Add Employee",
          APIClientInfo.AESKey
        );
      } else {
        const addemployee = await Employee.create(dec);
        const Response = {
          Status: "Success",
          Data: addemployee,
          Message: "Successfully! Record has been inserted.",
        };

        await APIUser.updateOne(
          {
            APIClientID: req.header("API-Client-ID"),
            APISecretKey: req.header("API-Secret-Key"),
          },
          {
            $inc: {
              APICalls: 1,
            },
          }
        );

        const inc = encrypt(Response, APIClientInfo.AESKey);
        //Send Response
        res.status(201).json(inc);
        //Log
        Log(
          req,
          inc,
          IP,
          APIClientInfo.APIClientID,
          "Add Employee",
          APIClientInfo.AESKey
        );
      }
    } catch (err) {
      const Response = {
        Error: {
          Status: 500,
          Message: "Internal Server Error",
          Info: err,
        },
      };
      res.status(500).json(Response);
      Log(
        req,
        Response,
        IP,
        APIClientInfo.APIClientID,
        "Add Employee",
        APIClientInfo.AESKey
      );
    }
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        Status: 401,
        Message: "Unauthorized",
      },
    });
  }
};

//@dec      Delete Encrypted Employee using Employee ID
//@route    DELETE /api/v2/employee/:id
//@access   Private (Client API Key and AES-Key for Encryption/Decryption)
exports.SecDelEmployeeByID = async (req, res, next) => {
  var IP = req.header("X-Real-IP");
  const reqbody = {
    _id: req.params.id,
  };
  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header("API-Client-ID"),
    APISecretKey: req.header("API-Secret-Key"),
  });
  //console.log(APIClientInfo);
  if (
    APIClientInfo &&
    APIClientInfo.ActivationStatus === 1 &&
    APIClientInfo.APICallLimit >= APIClientInfo.APICalls
  ) {
    try {
      const delemployee = await Employee.findById(req.params.id).select("-__v");
      //if Employee not found in DB
      if (!delemployee) {
        const Response = {
          Error: {
            Status: 404,
            Message: "Employee Not Found",
          },
        };
        //Send Response
        res.status(404).json(Response);
        Log(
          req,
          Response,
          IP,
          APIClientInfo.APIClientID,
          "Delete Employee",
          APIClientInfo.AESKey
        );
      } else {
        //Remove Employee
        await delemployee.remove();
        const Response = {
          Status: "Success",
          Data: delemployee,
          Message: "Successfully! Record has been deleted.",
        };

        await APIUser.updateOne(
          {
            APIClientID: req.header("API-Client-ID"),
            APISecretKey: req.header("API-Secret-Key"),
          },
          {
            $inc: {
              APICalls: 1,
            },
          }
        );

        const inc = encrypt(Response, APIClientInfo.AESKey);
        //Send Response
        res.status(200).json(inc);
        //Log
        Log(
          req,
          inc,
          IP,
          APIClientInfo.APIClientID,
          "Delete Employee",
          APIClientInfo.AESKey
        );
      }
    } catch (err) {
      const Response = {
        Error: {
          Status: 500,
          Message: "Internal Server Error",
          Info: err,
        },
      };
      //Send Error
      res.status(500).json(Response);
      //Log
      Log(
        req,
        Response,
        IP,
        APIClientInfo.APIClientID,
        "Delete Employee",
        APIClientInfo.AESKey
      );
    }
  } else {
    //if APi-Key is not valid
    res.status(401).json({
      Error: {
        Status: 401,
        Message: "Unauthorized",
      },
    });
  }
};

//@dec      Update Encrypted Employee
//@route    POST /api/v2/employee/update
//@access   Private (Client API Key and AES-Key for Encryption/Decryption)
exports.SecUpdateEmployee = async (req, res, next) => {
  var date = moment().tz("Asia/Kolkata").format("MMMM Do YYYY, hh:mm:ss A");
  var IP = req.header("X-Real-IP");
  //validate API-Key
  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header("API-Client-ID"),
    APISecretKey: req.header("API-Secret-Key"),
  });
  //console.log(APIClientInfo);
  if (
    APIClientInfo &&
    APIClientInfo.APICallLimit >= APIClientInfo.APICalls &&
    APIClientInfo.ActivationStatus === 1
  ) {
    try {
      const dec = decrypt(req.body, APIClientInfo.AESKey);
      //Capture Request Body
      const { EmpRefNo, Name, PhoneNo, Age, Department, Salary } = dec;
      //console.log(dec);
      //if _id is not present in RequestBody
      if (
        EmpRefNo == null ||
        Name == null ||
        PhoneNo == null ||
        Age == null ||
        Department == null ||
        Salary == null
      ) {
        //Send Error
        const Response = {
          Error: {
            Status: 400,
            Message: "Some fields are not present in encrypted request body",
          },
        };
        //Send Response
        res.status(400).json(Response);
        //Log
        Log(
          req,
          Response,
          IP,
          APIClientInfo.APIClientID,
          "Update Method",
          APIClientInfo.AESKey
        );
      } else {
        //Update Emplyee Info
        const updateemployee = await Employee.findOneAndUpdate(
          { _id: EmpRefNo },
          {
            $set: {
              Name: Name,
              PhoneNo: PhoneNo,
              Age: Age,
              Department: Department,
              Salary: Salary,
              ModifiedAt: date,
            },
          },
          { new: true }
        ).select("-__v");
        //console.log(updateemployee);

        if (!updateemployee) {
          const Response = {
            Status: 400,
            Message: "Something went wrong",
          };

          res.status(400).json(Response);
          //Log
          Log(
            req,
            Response,
            IP,
            APIClientInfo.APIClientID,
            "Update Method",
            APIClientInfo.AESKey
          );
        } else {
          const Response = {
            Status: "Success",
            Data: updateemployee,
            Message: "Successfully! Record has been updated.",
          };

          await APIUser.updateOne(
            {
              APIClientID: req.header("API-Client-ID"),
              APISecretKey: req.header("API-Secret-Key"),
            },
            {
              $inc: {
                APICalls: 1,
              },
            }
          );

          const inc = encrypt(Response, APIClientInfo.AESKey);
          //Send Success Response
          res.status(200).json(inc);
          //Log
          Log(
            req,
            inc,
            IP,
            APIClientInfo.APIClientID,
            "Update Method",
            APIClientInfo.AESKey
          );
        }
      }
    } catch (err) {
      //console.log(err);
      //send Error
      var Response = {
        Error: {
          Status: 500,
          Message: "Internal Server Error",
          Info: err,
        },
      };
      res.status(500).json(Response);
      Log(
        req,
        Response,
        IP,
        APIClientInfo.APIClientID,
        "Update Method",
        APIClientInfo.AESKey
      );
    }
  } else {
    //API-Key is not valid
    res.status(401).json({
      Error: {
        Status: 401,
        Message: "Unauthorized",
      },
    });
  }
};

//@dec      Encrypted Json Request
//@route    POST /api/v2/encreq
//@access   Private (AES-Key for Encryption)
exports.encryptAPI = (req, res) => {
  try {
    const key = req.header("AES-Key");
    //console.log(req.body)
    //const { Name, PhoneNo, Department, Age, Salary } = req.body;
    if (req.body) {
      const iv = crypto.randomBytes(16);
      let plaintext = JSON.stringify(req.body);
      let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
      let encrypted = cipher.update(plaintext);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      console.log(iv.toString("hex"));
      const Response = {
        EncData: iv.toString("hex") + encrypted.toString("hex"),
      };
      res.status(200).json(Response);
    } else {
      res.status(400).json({
        Error: {
          Status: 400,
          Message: "Request body is not found",
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      Error: {
        Status: 500,
        Message: "Internal Server Error",
        Info: error,
      },
    });
  }
};

//@dec      Decrypt Json Request
//@route    POST /api/v2/decreq
//@access   Private (AES-Key for Decryption)
exports.decryptAPI = (req, res) => {
  try {
    const key = req.header("AES-Key");
    const { EncData } = req.body;
    if (req.body.EncData) {
      const Refno = EncData.slice(0, 32);
      const Data = EncData.slice(32);
      //console.log(Refno)
      //console.log(Data)
      let iv = Buffer.from(Refno, "hex");
      let encryptedText = Buffer.from(Data, "hex");
      let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      const DecData = JSON.parse(decrypted.toString());
      res.status(200).json(DecData);
    } else {
      res.status(400).json({
        Error: {
          Status: 400,
          Message: "Request body is not found",
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      Error: {
        Status: 500,
        Message: "Internal Server Error",
        Info: error,
      },
    });
  }
};
