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

//* Route for Web Application *\\

route.route('/').get(GetRenderEmployees);
route.route('/add').post(AddRenderEmployee);
route.route('/update').post(UpdateRenderEmployee);
route.route('/del').get(DelRenderEmployeeByID);

//* Route for JSON base response API*\\
route
  .route('/api/v1/employee')
  .get(GetEmployees)
  .post(AddEmployee)
  .patch(UpdateEmployee);

route.route('/api/v1/employee/:id').delete(DelEmployeeByID).get(GetEmployeeByID);

module.exports = route;
