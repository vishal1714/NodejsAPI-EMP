const Employee = require('../models/EmployeeSchema');
const APIUser = require('../models/APIUserSchema');
const crypto = require('crypto');
//const {
//  performance
//} = require('perf_hooks');
const { Log } = require('./APILogManager');
const moment = require('moment-timezone');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const algorithm = 'aes-256-cbc';

/*  Functions  */
//! Encrypt Function
const encrypt = (text1, apikey) => {
  const key = apikey || process.env.ENCRYPTION_KEY;
  //console.log(key);
  const iv = crypto.randomBytes(16);
  let text = JSON.stringify(text1);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const Response = {
    Refno: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
  return Response;
};

//! Decrypt Function
const decrypt = (req, apikey) => {
  const key = apikey || process.env.ENCRYPTION_KEY;
  const { Refno, encryptedData } = req;
  //console.log(key);
  let iv = Buffer.from(Refno, 'hex');
  let encryptedText = Buffer.from(encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

//@dec      Get Encrypted Employee using Employee ID
//@route    GET /api/v2/employee/:id
//@access   Private (AES-Key for Encryption/Decryption)
exports.SecGetEmployeeByID = async (req, res, next) => {
    var IP = req.header('X-Real-IP');
    const reqbody = {
      _id: req.params.id,
    };
    const APIClientInfo = await APIUser.findOne({
      APIClientID: req.header('API-Client-ID'),
      APISecretKey: req.header('API-Secret-Key'),
    });
    //console.log(APIClientInfo);
    if(APIClientInfo){
      try {
      const getemployeebyid = await Employee.findById(req.params.id).select(
        '-__v'
      );
      
      //if Employee ID not found in DB
      if (!getemployeebyid) {
        const Response = {
          Error: {
            message: 'Employee not found',
          },
        };
        res.status(404).json(Response);
        Log(reqbody, Response, IP, APIClientInfo.APIClientID, 'Get Employee', APIClientInfo.AESKey);
      } else {
        //Send Success Response
        const Response = {
          Status: 'Success',
          Data: getemployeebyid,
          Message: 'Successfully! Record has been fetched.',
        };
        const inc = encrypt(Response, APIClientInfo.AESKey);
        res.status(200).json(inc);
        Log(reqbody, inc, IP, APIClientInfo.APIClientID, 'Get Employee', APIClientInfo.AESKey);
      }
    } catch (err) {
      const Response = {
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      };
      //Send Error
      res.status(500).json(Response);
      Log(reqbody, Response, IP, APIClientInfo.APIClientID, 'Get Employee', APIClientInfo.AESKey);
    }
    }else {
      //if API-Key is not valid
      res.status(401).json({
        Error: {
          message: 'Unauthorized',
        },
      });
    }
    
};

//@dec      Add Encrypted Employee
//@route    POST /api/v2/employee/add
//@access   Private (Client API Key and AES-Key for Encryption/Decryption)
exports.SecAddEmployee = async (req, res, next) => {
  var IP = req.header('X-Real-IP');

  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header('API-Client-ID'),
    APISecretKey: req.header('API-Secret-Key'),
  });
  //console.log(APIClientInfo);
  if (APIClientInfo  && APIClientInfo.APICallLimit != APIClientInfo.APICalls) {
    try {
      // Decrypt Encrypted Request
      const dec = decrypt(req.body, APIClientInfo.AESKey);
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
            message: 'Some fileds are not present in encrypted request body',
          },
        };
        //Send Response
        res.status(400).json(Response);
        //Log
        Log(req.body, Response, IP, APIClientInfo.APIClientID, 'Add Employee', APIClientInfo.AESKey);
      }else{
      const addemployee = await Employee.create(dec);
      const Response = {
        Status: 'Success',
        Data: addemployee,
        Message: 'Successfully! Record has been inserted.',
      };
      
      setTimeout(async () => {
        APIClientInfo.APICalls++;
        await APIClientInfo.save();
        //console.log(APIClientInfo)
      }, 100);

      
      const inc = encrypt(Response, APIClientInfo.AESKey);
      //Send Response
      res.status(201).json(inc);
  
      //Log
      Log(req.body, inc, IP, APIClientInfo.APIClientID, 'Add Employee', APIClientInfo.AESKey);
    } 
  }
    catch (err) {

        const Response = {
          Error: {
            message: 'Internal Server Error',
            info: err,
          },
        };
        res.status(500).json(Response);
      Log(req.body, Response, IP, APIClientInfo.APIClientID, 'Add Employee', APIClientInfo.AESKey);
    }
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        message: 'Unauthorized or Rate Limit Exceeded ',
      },
    });
  }
};

//@dec      Delete Encrypted Employee using Employee ID
//@route    DELETE /api/v2/employee/:id
//@access   Private (Client API Key and AES-Key for Encryption/Decryption)
exports.SecDelEmployeeByID = async (req, res, next) => {
  var IP = req.header('X-Real-IP');
  const reqbody = {
    _id: req.params.id,
  };
  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header('API-Client-ID'),
    APISecretKey: req.header('API-Secret-Key'),
  });
  //console.log(APIClientInfo);
  if (APIClientInfo) {
    try {
      const delemployee = await Employee.findById(req.params.id).select('-__v');
      //if Employee not found in DB
      if (!delemployee) {
        const Response = {
          Error: {
            message: 'Employee Not Found',
          },
        };
        //Send Response
        res.status(404).json(Response);
        Log(
          reqbody,
          Response,
          IP,
          APIClientInfo.APIClientID,
          'Delete Employee',
          APIClientInfo.AESKey
        );
        
      } else {
        //Remove Employee
        await delemployee.remove();
        const Response = {
          Status: 'Success',
          Data: delemployee,
          Message: 'Successfully! Record has been deleted.',
        };
        
      APIClientInfo.APICalls++;
      await APIClientInfo.save();

        const inc = encrypt(Response, APIClientInfo.AESKey);
        //Send Response
        res.status(200).json(inc);;
        //Log
        Log(
          reqbody,
          inc,
          IP,
          APIClientInfo.APIClientID,
          'Delete Employee',
          APIClientInfo.AESKey
        );
      }
    } catch (err) {
      const Response = {
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      };
      //Send Error
      res.status(500).json(Response);
      //Log
      Log(
        reqbody,
        Response,
        IP,
        APIClientInfo.APIClientID,
        'Delete Employee',
        APIClientInfo.AESKey
      );
    }
  } else {
    //if APi-Key is not valid
    res.status(401).json({
      Error: {
        message: 'Unauthorized',
      },
    });
  }
};

//@dec      Update Encrypted Employee
//@route    POST /api/v2/employee/update
//@access   Private (Client API Key and AES-Key for Encryption/Decryption)
exports.SecUpdateEmployee = async (req, res, next) => {
  var date = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
  var IP = req.header('X-Real-IP');
  //validate API-Key
  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header('API-Client-ID'),
    APISecretKey: req.header('API-Secret-Key'),
  });
  //console.log(APIClientInfo);
  if (APIClientInfo) {
    try {
      const dec = decrypt(req.body, APIClientInfo.AESKey);
      //Capture Request Body
      const { EmpRefNo, Name, PhoneNo, Age, Department, Salary } = dec;
      console.log(dec)
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
            message: 'Some fileds are not present in encrypted request body',
          },
        };
        //Send Response
        res.status(400).json(Response);
        //Log
        Log(req.body, Response, IP, APIClientInfo.APIClientID, 'Update Method', APIClientInfo.AESKey);
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
          },{new: true}
        ).select('-__v');
        console.log(updateemployee);

        if (!updateemployee) {
          const Response = {
            Status: 'Failed',
            Message: 'Something went wrong',
          };

          res.status(400).json(Response);
          //Log
          Log(
            req.body,
            Response,
            IP,
            APIClientInfo.APIClientID,
            'Update Method',
            APIClientInfo.AESKey
          );
        } else {
          const Response = {
            Status: 'Success',
            Data: updateemployee,
            Message: 'Successfully! Record has been updated.',
          };
          
        APIClientInfo.APICalls++;
        await APIClientInfo.save();

          const inc = encrypt(Response, APIClientInfo.AESKey);
          //Send Success Response
          res.status(200).json(inc);
          //Log
          Log(
            req.body,
            inc,
            IP,
            APIClientInfo.APIClientID,
            'Update Method',
            APIClientInfo.AESKey
          );
        }
      }
    } catch (err) {
      //console.log(err);
      //send Error
      var Response = {
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      };
      res.status(500).json(Response);
      Log(req.body, Response, IP, APIClientInfo.APIClientID, 'Update Method', APIClientInfo.AESKey);
    }
  } else {
    //API-Key is not valid
    res.status(401).json({
      Error: {
        message: 'Unauthorized',
      },
    });
  }
};

//@dec      Encrypted Json Request
//@route    POST /api/v2/encreq
//@access   Private (AES-Key for Encryption)
exports.encryptAPI = (req, res) => {
  try {
    const reqkey = req.header('AES-Key');
    const key = reqkey || process.env.ENCRYPTION_KEY;
    const { Name, PhoneNo, Department, Age, Salary } = req.body;
    const iv = crypto.randomBytes(16);
    let plaintext = JSON.stringify(req.body);
    //console.log(text);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(plaintext);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    //console.log(plaintext);
    //const Hash = crypto.createHash('sha256').update(plaintext).digest('hex');
    //console.log(Hash);
    const Response = {
      Refno: iv.toString('hex'),
      encryptedData: encrypted.toString('hex'),
    };
    res.status(200).json(Response);
  } catch (error) {
    res.status(500).json({
      Error: {
        message: 'Internal Server Error',
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
    const reqkey = req.header('AES-Key');
    const key = reqkey || process.env.ENCRYPTION_KEY;
    const { Refno, encryptedData } = req.body;
    let iv = Buffer.from(Refno, 'hex');
    let encryptedText = Buffer.from(encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const Data = JSON.parse(decrypted.toString());
    /*const Response = {
      Response: Data,
      Hash: Hash,
    };*/
    res.status(200).json(Data);
  } catch (error) {
    res.status(500).json({
      Error: {
        message: 'Internal Server Error',
        Info: error,
      },
    });
  }
};
