const Employee = require('../models/EmployeeSchema');
const APIUser = require('../models/APIUserSchema');
const { Log } = require('./APILogManager');
const moment = require('moment-timezone');

//@dec      Get All Employees
//@route    GET /api/v1/employees
//@access   Public
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

//@dec      Get Employee By Employee ID
//@route    GET /api/v1/employee/:id
//@access   Public
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

//@dec      Add Employee in DB
//@route    POST /api/v1/employee/add
//@access   Private (Client API-KEY)
exports.AddEmployee = async (req, res, next) => {
  var IP = req.header('X-Real-IP');
  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header('API-Client-ID'),
    APISecretKey: req.header('API-Secret-Key'),
  });
  //console.log(APIClientInfo);
  if (APIClientInfo) {
    try {
      //Copturaing API Request
      const { Name, PhoneNo, Age, Department, Salary } = req.body;
      const addemployee = await Employee.create(req.body);
      const Response = {
        Status: 'Success',
        Data: addemployee,
        Message: 'Successfully! Record has been inserted.',
      };
      
      APIClientInfo.APICalls++;
      await APIClientInfo.save();

      //Send Response
      res.status(201).json(Response);

      //Log
      Log(req.body, Response, IP, APIClientInfo.APIClientID, 'Add Employee');
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
        Log(req.body, Response, IP, APIClientInfo.APIClientID, 'Add Employee');
      } else {
        const Response = {
          Error: {
            message: 'Internal Server Error',
          },
        };
        res.status(500).json(Response);
        //Send Error
        Log(req.body, Response, IP, APIClientInfo.APIClientID, 'Add Employee');
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

//@dec      Delete Employee using Employee ID
//@route    DELETE /api/v1/employee/:id
//@access   Private (Client API-KEY)
exports.DelEmployeeByID = async (req, res, next) => {
  var IP = req.header('X-Real-IP');
  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header('API-Client-ID'),
    APISecretKey: req.header('API-Secret-Key'),
  });
  //Validate API-Key
  if (APIClientInfo) {
    try {
      const delemployee = await Employee.findById(req.params.id).select('-__v');
      const reqbody = {
        _id: req.params.id,
      };
      //if Employee not found in DB
      if (!delemployee) {
        const Response = {
          Error: {
            message: 'Employee Not Found',
          },
        };
        //Send Response
        Log(
          reqbody,
          Response,
          IP,
          APIClientInfo.APIClientID,
          'Delete Employee'
        );
        return res.status(404).json(Response);
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

        //Send Response
        res.status(200).json(Response);
        //Log
        Log(
          reqbody,
          Response,
          IP,
          APIClientInfo.APIClientID,
          'Delete Employee'
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
      Log(reqbody, Response, IP, APIClientInfo.APIClientID, 'Delete Employee');
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

//@dec      Update Employee
//@route    PATCH /api/v1/employee/update
//@access   Private (Client API-KEY)
exports.UpdateEmployee = async (req, res, next) => {
  var date = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
  var IP = req.header('X-Real-IP');
  const APIClientInfo = await APIUser.findOne({
    APIClientID: req.header('API-Client-ID'),
    APISecretKey: req.header('API-Secret-Key'),
  });
  //Validate API-Key
  if (APIClientInfo) {
    try {
      //Capture Request Body
      const { EmpRefNo, Name, PhoneNo, Age, Department, Salary } = req.body;
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
            message: 'Some fileds are not present in request body',
          },
        };
        //Send Response
        res.status(400).json(Response);
        //Log
        Log(req.body, Response, IP, APIClientInfo.APIClientID, 'Update Method');
      } else {
        //Update Emplyee Info
        const updateemployee = await Employee.updateOne(
          { _id: req.body.EmpRefNo },
          {
            $set: {
              Name: req.body.Name,
              PhoneNo: req.body.PhoneNo,
              Age: req.body.Age,
              Department: req.body.Department,
              Salary: req.body.Salary,
              ModifiedAt: date,
            },
          }
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
            'Update Method'
          );
        } else {
          const Response = {
            Status: 'Success',
            Data: req.body,
            Message: 'Successfully! Record has been updated.',
          };
          
      APIClientInfo.APICalls++;
      await APIClientInfo.save();
          //Send Success Response
          res.status(200).json(Response);
          //Log
          Log(
            req.body,
            Response,
            IP,
            APIClientInfo.APIClientID,
            'Update Method'
          );
        }
      }
    } catch (err) {
      //send Error
      var Response = {
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      };
      res.status(500).json(Response);
      Log(req.body, Response, IP, APIClientInfo.APIClientID, 'Update Method');
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
