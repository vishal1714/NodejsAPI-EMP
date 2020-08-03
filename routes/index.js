const express = require('express');
const {
  AddEmployee,
  GetEmployeeByID,
  GetEmployees,
  UpdateEmployee,
  DelEmployeeByID,
} = require('../controllers/EmpFunctions');
const {
  GetRenderEmployees,
  AddRenderEmployee,
  UpdateRenderEmployee,
  DelRenderEmployeeByID,
} = require('../controllers/EmpRenderFunctions');

const Employee = require('../models/Employee');

const route = express.Router();

route
  .route('/')
  .get(GetRenderEmployees)
  .post(AddRenderEmployee)
  .patch(UpdateRenderEmployee)
  .get(DelRenderEmployeeByID);

route
  .route('/api/v1/employee')
  .get(GetEmployees)
  .post(AddEmployee)
  .patch(UpdateEmployee);

route.route('/:id').get(DelRenderEmployeeByID);

module.exports = route;
