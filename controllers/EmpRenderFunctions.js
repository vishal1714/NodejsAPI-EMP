const Employee = require('../models/EmployeeSchema');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

//@dec      Get Employees
//@route    GET /
//@access   Public
exports.GetRenderEmployees = async (req, res, next) => {
  try {
    const GetEmployees = await Employee.find().select('-__v');
    res.render('index', { GetEmployees });
  } catch (err) {
    console.log(messages);
    res.render('index', { messages: 'Internal Server Error' });
  }
};

//@dec      Add Employees
//@route    POST /add
//@access   Public
exports.AddRenderEmployee = async (req, res, next) => {
  try {
    const { Name, PhoneNo, Department, Age, Salary } = req.body;
    const EmployeeAdd = await Employee.create(req.body);
    const Response = {
      Status: 'Success',
      Data: EmployeeAdd,
      Message: 'Successfully! Record has been inserted.',
    };
    //console.log(AResponse);
    res.render('addemployee', {
      AddResponse: JSON.stringify(Response),
      AddRequest: JSON.stringify(req.body),
    });
  } catch (err) {
    if (err.name == 'ValidationError') {
      const messages = Object.values(err.errors).map((val) => val.message);
      res.render('addemployee', { messages });
    } else {
      res.render('addemployee', { messages: 'Internal Server Error' });
    }
  }
};

//@dec      Update Employee
//@route    POST /update
//@access   Public
exports.UpdateRenderEmployee = async (req, res, next) => {
  try {
    const { _id, Name, PhoneNo, Department, Age, Salary } = req.body;
    if (req.body._id == null) {
      res.render('updateemployee', { messages: 'Employee _id is not found' });
    }
    const employee = await Employee.findOneAndUpdate(
      { _id: req.body._id },
      {
        $set: {
          Name: req.body.Name,
          PhoneNo: req.body.PhoneNo,
          Department: req.body.Department,
          Age: req.body.Age,
          Salary: req.body.Salary,
        },
      }
    ).select('-__v');
    res.render('updateemployee', { Response: employee });
  } catch (messages) {
    res.render('index', { messages });
  }
};

//@dec      Delete Employee by ID
//@route    DELETE /del/:id
//@access   Public
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

//@dec      Encrypte Request
//@route    POST /encrypt
//@access   Public
exports.encryptAPI = async (req, res, next) => {
  try {
    const { plaintext, key } = req.body;
    const iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(plaintext);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const response = {
      Refno: iv.toString('hex'),
      encryptedData: encrypted.toString('hex'),
    };
    const aresponse = JSON.stringify(response);
    console.log(aresponse);
    res.render('encdec', { enresponse: aresponse });
  } catch (err) {
    //console.log(err);
    res.render('index', { messages: 'Internal Server Error' });
  }
};

//@dec      decrypte Request
//@route    POST /decrypt
//@access   Public
exports.decryptAPI = async (req, res, next) => {
  try {
    const { plaintext, key } = req.body;
    const text = JSON.parse(plaintext);
    const { Refno, encryptedData } = text;
    let iv = Buffer.from(Refno, 'hex');
    let encryptedText = Buffer.from(encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const response = decrypted.toString();
    res.render('encdec', { deresponse: response });
  } catch (error) {
    console.log(error);
    res.render('index', { messages: 'Internal Server Error' });
  }
};
