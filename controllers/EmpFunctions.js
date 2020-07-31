const Employee = require('../models/Employee');
const ValidKey = 'Vishal1714';
var reqKey = req.header('API-Key');

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
  var reqKey = req.header('API-Key');
  if (reqKey == ValidKey) {
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
  } else {
    res.status(401);
    next(new Error('Unauthorized'));
  }
};

exports.DelEmployeeByID = async (req, res, next) => {
  var reqKey = req.header('API-Key');
  if (reqKey == ValidKey) {
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
  } else {
    res.status(401);
    next(new Error('Unauthorized'));
  }
};

exports.UpdateEmployee = async (req, res, next) => {
  var reqKey = req.header('API-Key');
  if (reqKey == ValidKey) {
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
  } else {
    res.status(401);
    next(new Error('Unauthorized'));
  }
};
