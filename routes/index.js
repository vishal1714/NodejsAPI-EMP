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

const Employee = require('../models/EmployeeSchema');

const Route = express.Router();

//* Route for Web Application *\\

Route.route('/').get(GetRenderEmployees);
Route.route('/add').post(AddRenderEmployee);
Route.route('/update').post(UpdateRenderEmployee);
Route.route('/del').get(DelRenderEmployeeByID);

//* Route for JSON base response API*\\
Route.route('/api/v1/employee')
  .get(GetEmployees)
  .post(AddEmployee)
  .patch(UpdateEmployee);

Route.route('/api/v1/employee/:id')
  .delete(DelEmployeeByID)
  .get(GetEmployeeByID);

module.exports = Route;
