const Employee = require('../models/Employee');
const ValidKey = 'Vishal1714';
const moment = require('moment');

m=moment().format("MMMM Do YYYY, hh:mm:ss a");

exports.GetEmployees = async (req, res, next) => {
  try {
    const GetEmployees = await Employee.find().select('-__v');
    return res.status(200).json({
      Status: 'Success',
      Count: GetEmployees.length,
      Data: GetEmployees,
    });
  } catch (err) {
    console.log(err);
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
    if (!employee) {
      res.status(404).json({
        Error: {
          message: 'Employee not found',
        },
      });
    } else {
      return res.status(200).json({
        Status: 'Success',
        Data: employee,
        Message: 'Successfully! Record has been fetched.',
      });
    }
  } catch (err) {
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
  if (reqKey == ValidKey) {
    try {
      const { Name, DOB, Age, Department, Salary } = req.body;
      const EmployeeAdd = await Employee.create(req.body);

      return res.status(201).json({
        Status: 'Success',
        Data: EmployeeAdd,
        Message: 'Successfully! Record has been inserted.',
      });
    } catch (err) {
      if (err.name == 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        res.status(400).json({
          Error: {
            message: messages,
          },
        });
      } else {
        res.status(500).json({
          Error: {
            message: 'Internal Server Error',
          },
        });
      }
    }
  } else {
    res.status(401).json({
      Error: {
        message: 'Unauthorized',
      },
    });
  }
};

exports.DelEmployeeByID = async (req, res, next) => {
  var reqKey = req.header('API-Key');
  if (reqKey == ValidKey) {
    try {
      const employee = await Employee.findById(req.params.id).select('-__v');
      if (!employee) {
        res.status(404).json({
          Error: {
            message: 'Employee Not Found',
          },
        });
      } else {
        await employee.remove();
        return res.status(200).json({
          Status: 'Success',
          DeletedAt: m,
          Data: employee,
          Message: 'Successfully! Record has been deleted.',
        });
      }
    } catch (err) {
      res.status(500).json({
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      });
    }
  } else {
    res.status(401).json({
      Error: {
        message: 'Unauthorized',
      },
    });
  }
};

exports.UpdateEmployee = async (req, res, next) => {
  var reqKey = req.header('API-Key');
  if (reqKey == ValidKey) {
    try {
      const { _id, Name, DOB, Age, Department, Salary } = req.body;
      console.log(req.body._id);
      if (req.body._id == null) {
        res.status(400).json({
          Error: {
            message: '_id not present in request body',
          },
        });
      }
      const employee = await Employee.findOneAndUpdate(
        { _id: req.body._id },
        {
          $set: {
            Name: req.body.Name,
            DOB: req.body.DOB,
            Age: req.body.Age,
            Department: req.body.Department,
            Salary: req.body.Salary,
          },
        }
      ).select('-__v');

      return res.status(200).json({
        Status: 'Success',
        Data: req.body,
        Message: 'Successfully! Record has been updated.',
      });
    } catch (err) {
      res.status(500).json({
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      });
    }
  } else {
    res.status(401).json({
      Error: {
        message: 'Unauthorized',
      },
    });
  }
};
