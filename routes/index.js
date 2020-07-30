const express = require('express');
const {
  AddEmployee,
  GetEmployeeByID,
  GetEmployees,
  UpdateEmployee,
  DelEmployeeByID,
  GetQEmployeeByID,
  GetEmployeeByDepartmentCode,
} = require('../controllers/EmpFunctions');

const Employee = require('../models/Employee');

const route = express.Router();

route.route('/').get(GetEmployees).post(AddEmployee).patch(UpdateEmployee);

route.route('/:id').get(GetEmployeeByID).delete(DelEmployeeByID);

route.route('/Q/EmployeeID').get(GetQEmployeeByID);

route.route('/Q/DepartmentCode').get(GetEmployeeByDepartmentCode);

module.exports = route;
