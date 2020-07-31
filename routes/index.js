const express = require('express');
const {
  AddEmployee,
  GetEmployeeByID,
  GetEmployees,
  UpdateEmployee,
  DelEmployeeByID,
} = require('../controllers/EmpFunctions');

const Employee = require('../models/Employee');

const route = express.Router();

route.route('/').get(GetEmployees).post(AddEmployee).patch(UpdateEmployee);

route.route('/:id').get(GetEmployeeByID).delete(DelEmployeeByID);

module.exports = route;
