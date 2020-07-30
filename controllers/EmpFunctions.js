const Employee = require('../models/Employee');
const uuid = require('uuid');

exports.GetEmployees = async (req, res, next) => {
  try {
    const GetEmployees = await Employee.find();
    return res.status(200).json({
      Status: 'Successful',
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
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404);
      next(new Error('Employee not  Found'));
    } else {
      return res.status(200).json({
        Status: 'Successful',
        Data: employee,
      });
    }
  } catch (err) {
    res.status(500);
    next(new Error('Internal Server Error'));
  }
};

exports.AddEmployee = async (req, res, next) => {
  try {
    const { Fname, Lname, Depname, Salary } = req.body;
    const EmployeeAdd = await Employee.create(req.body);

    return res.status(201).json({
      Status: 'Successful',
      Data: EmployeeAdd,
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
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404);
      next(new Error('Employee Not Found'));
    } else {
      const delDate = new Date().toISOString();

      await employee.remove();
      return res.status(200).json({
        Status: 'Successful',
        DeletedAt: delDate,
        Data: employee,
      });
    }
  } catch (err) {
    res.status(500);
    next(new Error(err));
  }
};

exports.UpdateEmployee = async (req, res, next) => {
  try {
    const { _id, Fname, Lname, Depname, Salary } = req.body;
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
          Depname: req.body.Depname,
          Salary: req.body.Salary,
        },
      }
    );

    return res.status(200).json({
      Status: 'Successful',
      Data: req.body,
    });
  } catch (err) {
    res.status(500);
    next(new Error(err));
  }
};

exports.GetQEmployeeByID = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.query.EmployeeID);
    if (!employee) {
      res.status(404);
      next(new Error('Employee Not Found'));
    } else {
      return res.status(200).json({
        Status: 'Successful',
        Data: employee,
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
    });
    if (!employee) {
      res.status(404);
      next(new Error('Department Not Found'));
    } else {
      return res.status(200).json({
        Status: 'Successful',
        Count: employees.length,
        Data: employees,
      });
    }
  } catch (err) {
    res.status(500);
    next(new Error('Internal Server Error'));
  }
};
