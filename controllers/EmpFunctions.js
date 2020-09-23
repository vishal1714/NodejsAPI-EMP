const Employee = require('../models/EmployeeSchema');
const APIAdmin = require('../models/APIAdminSchema');

const { Log } = require('./APILogManager');
const { encrypt, decrypt } = require('./crypto');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const ValidKey = 'Vishal1714';
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

exports.GetEmployees = async (req, res, next) => {
  try {
    const getemployee = await Employee.find().select('-__v');
    //Send Success Response
    res.status(200).json({
      Status: 'Success',
      Count: getemployee.length,
      Data: getemployee,
    });
  } catch (err) {
    console.log(err);
    //Send Error
    res.status(500).json({
      Error: {
        message: 'Internal Server Error',
        info: err,
      },
    });
  }
};

exports.GetEmployeeByID = async (req, res, next) => {
  try {
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
      return res.status(200).json({
        Status: 'Success',
        Data: getemployeebyid,
        Message: 'Successfully! Record has been fetched.',
      });
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

exports.AddEmployee = async (req, res, next) => {
  var reqKey = req.header('API-Key');
  var IP = req.header('X-Real-IP');
  // Validate API-Key
  //var a = ValidateKey(reqKey);
  //console.log(a);
  if (reqKey == ValidKey) {
    try {
      //Copturaing API Request
      const { Name, Zip, Age, Department, Salary } = req.body;
      const addemployee = await Employee.create(req.body);
      const Response = {
        Status: 'Success',
        Data: addemployee,
        Message: 'Successfully! Record has been inserted.',
      }; 
      const inc = encrypt(Response);
      //console.log(inc);
      //Send Response
      const FullResponse = {
        ActualResponse : Response,
        EncryptedResponse : inc
      }
      //Send Response
      res.status(201).json(FullResponse);
      //Log
      Log(req, Response, IP, reqKey, 'Add Employee');

    } catch (err) {
      //if Valid Error Found
      if (err.name == 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        const Response = {
          Error: {
            message: messages,
          },
        };
        res.status(400).json(Response);
        Log(req, Response, IP, reqKey, 'Add Employee');
      } else {
        const Response = {
          Error: {
            message: 'Internal Server Error',
          },
        };
        res.status(500).json(Response);
        //Send Error
        Log(req, Response, IP, reqKey, 'Add Employee');
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

exports.DelEmployeeByID = async (req, res, next) => {
  var reqKey = req.header('API-Key');
  var IP = req.header('X-Real-IP');
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
        Log(req, Response, IP, reqKey, 'Delete Employee');
        return res.status(404).json(Response);
      } else {
        //Remove Employee
        await delemployee.remove();
        const Response = {
          Status: 'Success',
          Data: delemployee,
          Message: 'Successfully! Record has been deleted.',
        };
        //Send Response
        res.status(200).json(Response);
        //Log
        Log(req, Response, IP, reqKey, 'Delete Employee');
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
      Log(req, Response, IP, reqKey, 'Delete Employee');
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

exports.UpdateEmployee = async (req, res, next) => {
  var reqKey = req.header('API-Key');
  var IP = req.header('X-Real-IP');
  //validate API-Key
  if (reqKey == ValidKey) {
    try {
      //Capture Request Body
      const { EmpRefNo, Name, Zip, Age, Department, Salary } = req.body;
      //if _id is not present in RequestBody
      if (req.body.EmpRefNo == null) {
        //Send Error
        const Response = {
          Error: {
            message: 'EmpRefNo not present in request body',
          },
        };
        //Send Response
        res.status(400).json(Response);
        //Log
        Log(req, Response, IP, reqKey, 'Update Method');
      }
      //Update Emplyee Info
      const updateemployee = await Employee.findOneAndUpdate(
        { _id: req.body.EmpRefNo },
        {
          $set: {
            Name: req.body.Name,
            Zip: req.body.Zip,
            Age: req.body.Age,
            Department: req.body.Department,
            Salary: req.body.Salary,
          },
        }
      ).select('-__v');
      const Response = {
        Status: 'Success',
        Data: req.body,
        Message: 'Successfully! Record has been updated.',
      };
      //Send Success Response
      res.status(200).json(Response);
      //Log
      Log(req, Response, IP, reqKey, 'Update Method');
    } catch (err) {
      //send Error
      var Response = {
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      };
      res.status(500).json(Response);
      Log(req, Response, IP, reqKey, 'Update Method');
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

exports.DecryptResponse = async (req, res, next) => {
  try {
    const { Refno, encryptedData } = req.body;
    //console.log(req.body);
    //let text = JSON.stringify(req.body);
    //console.log(text);
    const apikey = req.header('API-Key');
    const response = decrypt(Refno, encryptedData, apikey);
    //console.log(response);
    const respp = JSON.parse(response);
    res.status(200).send(respp);
  } catch (error) {
    res.status(500).json(error);
    //console.log(error);
  }
};
