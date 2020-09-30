const Employee = require('../models/EmployeeSchema');
//const APIAdmin = require('../models/APIAdminSchema');
const crypto = require('crypto');
const { Log } = require('./APILogManager');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const ValidKey = process.env.AdminAPIKey;
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

// TODO API Key Validation function
/* API Key Validation 
const ValidateKey = async (reqkey) => {
  var a = reqkey.toString();
  console.log(a);
  var validate = await APIAdmin.find({ APIKey: a });
  console.log(validate);
  if (!validate) {
    return 0;
  } else {
    return 1;
  }
};
*/

//@dec      Get Encrypted Employee using Employee ID
//@route    GET /api/v2/employee/:id
//@access   Private (AES-Key for Encryption/Decryption)
exports.SecGetEmployeeByID = async (req, res, next) => {
  try {
    var key = req.header('AES-Key');
    const getemployeebyid = await Employee.findById(req.params.id).select(
      '-__v'
    );
    //id Employee not found in DB
    if (!getemployeebyid) {
      res.status(404).json({
        Error: {
          message: 'Employee not found',
        },
      });
    } else {
      //Send Success Response
      const Response = {
        Status: 'Success',
        Data: getemployeebyid,
        Message: 'Successfully! Record has been fetched.',
      };
      const inc = encrypt(Response, key);
      return res.status(200).json(inc);
    }
  } catch (err) {
    //Send Error
    res.status(500).json({
      Error: {
        message: 'Internal Server Error',
        info: err,
      },
    });
  }
};

//@dec      Add Encrypted Employee
//@route    POST /api/v2/employee/add
//@access   Private (Client API Key and AES-Key for Encryption/Decryption)
exports.SecAddEmployee = async (req, res, next) => {
  var reqKey = req.header('API-Key');
  var key = req.header('AES-Key');
  var IP = req.header('X-Real-IP');

  if (reqKey == ValidKey) {
    try {
      // Decrypt Encrypted Request
      const dec = decrypt(req.body, key);
      const { Name, PhoneNo, Age, Department, Salary } = dec;
      const addemployee = await Employee.create(dec);
      const Response = {
        Status: 'Success',
        Data: addemployee,
        Message: 'Successfully! Record has been inserted.',
      };
      const inc = encrypt(Response, key);
      //Send Response
      res.status(201).json(inc);
      //Log
      Log(dec, Response, IP, reqKey, 'Add Employee', key);
    } catch (err) {
      //if Valid Error Found
      if (err.name == 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        const Response = {
          Error: {
            message: messages,
          },
        };
        const inc = encrypt(Response, key);
        res.status(400).json(inc);
      } else {
        const Response = {
          Error: {
            message: 'Internal Server Error',
            info: err,
          },
        };
        res.status(500).json(Response);
      }
    }
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        message: 'Unauthorized',
      },
    });
  }
};

//@dec      Delete Encrypted Employee using Employee ID
//@route    DELETE /api/v2/employee/:id
//@access   Private (Client API Key and AES-Key for Encryption/Decryption)
exports.SecDelEmployeeByID = async (req, res, next) => {
  var reqKey = req.header('API-Key');
  var key = req.header('AES-Key');
  var IP = req.header('X-Real-IP');
  const reqbody = {
    _id: req.params.id,
  };
  //Validate API-Key
  if (reqKey == ValidKey) {
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
        Log(reqbody, Response, IP, reqKey, 'Delete Employee', key);
        return res.status(404).json(Response);
      } else {
        //Remove Employee
        await delemployee.remove();
        const Response = {
          Status: 'Success',
          Data: delemployee,
          Message: 'Successfully! Record has been deleted.',
        };
        const inc = encrypt(Response, key);
        //Send Response
        res.status(200).json(inc);
        //Log
        Log(reqbody, Response, IP, reqKey, 'Delete Employee', key);
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
      Log(reqbody, Response, IP, reqKey, 'Delete Employee', key);
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
  var reqKey = req.header('API-Key');
  var key = req.header('AES-Key');
  var IP = req.header('X-Real-IP');
  //validate API-Key
  if (reqKey == ValidKey) {
    try {
      const dec = decrypt(req.body, key);
      //Capture Request Body
      const { EmpRefNo, Name, PhoneNo, Age, Department, Salary } = dec;
      //if _id is not present in RequestBody
      if (EmpRefNo == null) {
        //Send Error
        const Response = {
          Error: {
            message: 'EmpRefNo not present in request body',
          },
        };
        //Send Response
        res.status(400).json(Response);
        //Log
        Log(dec, Response, IP, reqKey, 'Update Method', key);
      }
      //Update Emplyee Info
      const updateemployee = await Employee.updateOne(
        { _id: EmpRefNo },
        {
          $set: {
            Name: Name,
            PhoneNo: PhoneNo,
            Age: Age,
            Department: Department,
            Salary: Salary,
          },
        }
      ).select('-__v');
      const Response = {
        Status: 'Success',
        Data: dec,
        Message: 'Successfully! Record has been updated.',
      };
      const inc = encrypt(Response, key);
      //Send Success Response
      res.status(200).json(inc);
      //Log
      Log(dec, Response, IP, reqKey, 'Update Method', key);
    } catch (err) {
      //send Error
      var Response = {
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      };
      res.status(500).json(Response);
      Log(dec, Response, IP, reqKey, 'Update Method', key);
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
    const { Refno, encryptedData, Hash } = req.body;
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
