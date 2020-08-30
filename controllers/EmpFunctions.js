const Employee = require('../models/EmployeeSchema');
const Log = require('./EmployeeAPILog');

const ValidKey = 'Vishal1714';

exports.GetEmployees = async (req, res, next) => {
  try {
    const employee = await Employee.find().select('-__v');
    //Send Success Response
    res.status(200).json({
      Status: 'Success',
      Count: employee.length,
      Data: employee,
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
    const employee = await Employee.findById(req.params.id).select('-__v');
    //id Employee not found in DB
    if (!employee) {
      res.status(404).json({
        Error: {
          message: 'Employee not found',
        },
      });
    } else {
      //Send Success Response
      return res.status(200).json({
        Status: 'Success',
        Data: employee,
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
  // Validate API-Key
  if (reqKey == ValidKey) {
    try {
      //Copturaing API Request
      const { Name, Zip, Age, Department, Salary } = req.body;
      const employee = await Employee.create(req.body);
      const Response = {
        Status: 'Success',
        Data: employee,
        Message: 'Successfully! Record has been inserted.',
      };
      //Send Response
      res.status(201).json(Response);
      //Log
      const ReqRes = {
        Method: 'Add Employee',
        reqBody: req.body,
        resBody: Response,
      };
      Log(ReqRes);
    } catch (err) {
      //if Valid Error Found
      if (err.name == 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        res.status(400).json({
          Error: {
            message: messages,
          },
        });
      } else {
        //Send Error
        res.status(500).json({
          Error: {
            message: 'Internal Server Error',
          },
        });
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
  //Validate API-Key
  if (reqKey == ValidKey) {
    try {
      const employee = await Employee.findById(req.params.id).select('-__v');
      //if Employee not found in DB
      if (!employee) {
        res.status(404).json({
          Error: {
            message: 'Employee Not Found',
          },
        });
      } else {
        //Remove Employee
        await Employee.remove();
        const Response = {
          Status: 'Success',
          Data: employee,
          Message: 'Successfully! Record has been deleted.',
        };
        //Send Response
        res.status(200).json(Response);
        //Log
        const ReqRes = {
          Method: 'Delete Employee',
          reqBody: { _id: req.params.id },
          resBody: Response,
        };
        Log(ReqRes);
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
  //validate API-Key
  if (reqKey == ValidKey) {
    try {
      //Capture Request Body
      const { _id, Name, Zip, Age, Department, Salary } = req.body;
      //if _id is not present in RequestBody
      if (req.body._id == null) {
        //Send Error
        res.status(400).json({
          Error: {
            message: '_id not present in request body',
          },
        });
      }
      //Update Emplyee Info
      const employee = await Employee.findOneAndUpdate(
        { _id: req.body._id },
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
      const ReqRes = {
        Method: 'Update Employee',
        reqBody: req.body,
        resBody: Response,
      };
      Log(ReqRes);
    } catch (err) {
      //send Error
      res.status(500).json({
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      });
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
