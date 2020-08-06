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
    console.log(messages);
    res.render('index', { messages: 'Internal Server Error' });
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
      res.render('index', { messages });
    } else {
      res.render('index', { messages: 'Internal Server Error' });
    }
  }
};

exports.UpdateRenderEmployee = async (req, res, next) => {
  try {
    const { _id, Fname, Lname, Depname, Age, Salary } = req.body;
    if (req.body._id == null) {
      res.render('index', { messages: 'Employee _id is not found' });
    }
    const employee = await Employee.findOneAndUpdate(
      { _id: req.body._id },
      {
        $set: {
          Fname: req.body.Fname,
          Lname: req.body.Lname,
          Depname: req.body.Depname,
          Age: req.body.Age,
          Salary: req.body.Salary,
        },
      }
    ).select('-__v');
    res.redirect('/');
  } catch (messages) {
    res.render('index', { messages });
  }
};

exports.DelRenderEmployeeByID = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-__v');
    if (!employee) {
      res.render('index', { messages: 'Employee _id is not found' });
    } else {
      await employee.remove();
      res.redirect('/');
    }
  } catch (messages) {
    res.render('index', { messages });
  }
};
