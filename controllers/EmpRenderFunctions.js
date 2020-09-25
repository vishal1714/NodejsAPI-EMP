const Employee = require('../models/EmployeeSchema');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

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
    const { Name, Zip, Department, Age, Salary } = req.body;
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
    const { _id, Name, Zip, Department, Age, Salary } = req.body;
    if (req.body._id == null) {
      res.render('index', { messages: 'Employee _id is not found' });
    }
    const employee = await Employee.findOneAndUpdate(
      { _id: req.body._id },
      {
        $set: {
          Name: req.body.Name,
          Zip: req.body.Zip,
          Department: req.body.Department,
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

exports.encryptAPI = async (req, res, next) => {
  try {
    const { plaintext, key } = req.body;
    //console.log(req.body);
    const iv = crypto.randomBytes(16);
    let text = JSON.stringify(plaintext);
    //console.log(iv);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(plaintext);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const response = {
      Refno: iv.toString('hex'),
      encryptedData: encrypted.toString('hex'),
    };
    console.log(response);
    // const response = {
    //   Test: text,
    // };
    res.render('index', { response });
  } catch (err) {
    console.log(err);
    res.render('index', { messages: 'Internal Server Error' });
  }
};
