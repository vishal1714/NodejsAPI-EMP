const Employee = require('../models/Employee');
const uuid = require('uuid');

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
    res.status(500);
    next(new Error('Internal Server Error'));
  }
};

exports.GetEmployeeByID = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-__v');
    if (!employee) {
      res.status(404);
      next(new Error('Employee not Found'));
    } else {
      return res.status(200).json({
        Status: 'Success',
        Data: employee,
        Message: 'Successfully! Record has been fetched.',
      });
    }
  } catch (err) {
    res.status(500);
    next(new Error('Internal Server Error'));
  }
};

exports.AddEmployee = async (req, res, next) => {
  try {
    const { Fname, Lname, Age, Depname, Salary } = req.body;
    const EmployeeAdd = await Employee.create(req.body);

    return res.status(201).json({
      Status: 'Success',
      Data: EmployeeAdd,
      Message: 'Successfully! Record has been inserted.',
    });
  } catch (err) {
    if (err.name == 'ValidationError') {
      const messages = Object.values(err.errors).map((val) => val.message);

      res.status(400);
      next(new Error(messages));
    } else {
      res.status(500);
      next(new Error('Internal Server Error'));
    }
  }
};

exports.DelEmployeeByID = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-__v');
    if (!employee) {
      return res.status(404);
      next(new Error('Employee Not Found'));
    } else {
      const delDate = new Date().toISOString();

      await employee.remove();
      return res.status(200).json({
        Status: 'Success',
        DeletedAt: delDate,
        Data: employee,
        Message: 'Successfully! Record has been deleted.',
      });
    }
  } catch (err) {
    res.status(500);
    next(new Error(err));
  }
};

exports.UpdateEmployee = async (req, res, next) => {
  try {
    const { _id, Fname, Lname, Age, Depname, Salary } = req.body;
    console.log(req.body._id);
    if (req.body._id == null) {
      res.status(500);
      next(new Error('_id is not present'));
    }
    const employee = await Employee.findOneAndUpdate(
      { _id: req.body._id },
      {
        $set: {
          Fname: req.body.Fname,
          Lname: req.body.Lname,
          Age: req.body.Age,
          Depname: req.body.Depname,
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
    res.status(500);
    next(new Error(err));
  }
};

exports.GetQEmployeeByID = async (req, res, next) => {
  console.log(req.query.EmployeeID);
  try {
    const employee = await Employee.findById(req.query.EmployeeID).select(
      '-__v'
    );

    if (!employee) {
      res.status(404);
      next(new Error('Employee Not Found'));
    } else {
      return res.status(200).json({
        Status: 'Success',
        Data: employee,
        Message: 'Successfully! Record has been fetched.',
      });
    }
  } catch (err) {
    res.status(500);
    next(new Error('Internal Server Error'));
  }
};

exports.GetEmployeeByDepartmentCode = async (req, res, next) => {
  try {
    const employees = await Employee.findById({
      Depname: req.query.DepartmentCode,
    }).select('-__v');
    if (!employee) {
      res.status(404);
      next(new Error('Department Not Found'));
    } else {
      return res.status(200).json({
        Status: 'Success',
        Count: employees.length,
        Data: employees,
        Message: 'Successfully! Record has been fetched.',
      });
    }
  } catch (err) {
    res.status(500);
    next(new Error('Internal Server Error'));
  }
};
