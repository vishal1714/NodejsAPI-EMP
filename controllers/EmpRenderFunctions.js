const Employee = require('../models/Employee');

// Render Methods
exports.GetRenderEmployees = async (req, res, next) => {
  try {
    const GetEmployees = await Employee.find().select('-__v');

    res.render('index', { GetEmployees });
    /*;
       return res.status(200).json({
        Status: 'Success',
        Count: GetEmployees.length,
        Data: GetEmployees,
      }); */
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

exports.AddRenderEmployee = async (req, res, next) => {
  try {
    const { Fname, Lname, Depname, Age, Salary } = req.body;
    const EmployeeAdd = await Employee.create(req.body);
    res.redirect('/');
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
};

exports.UpdateRenderEmployee = async (req, res, next) => {
  try {
    const { _id, Fname, Lname, Age, Depname, Salary } = req.body;
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
    res.status(500).json({
      Error: {
        message: 'Internal Server Error',
        info: err,
      },
    });
  }
};

exports.DelRenderEmployeeByID = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-__v');
    if (!employee) {
      res.status(404).json({
        Error: {
          message: 'Employee Not Found',
        },
      });
    } else {
      const delDate = new Date().toISOString();

      await employee.remove();
      res.redirect('/');
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
