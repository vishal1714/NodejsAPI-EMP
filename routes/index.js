const express = require('express');
const {
  AddEmployee,
  GetEmployeeByID,
  GetEmployees,
  UpdateEmployee,
  DelEmployeeByID,
} = require('../controllers/EmpFunctions');

const Route = express.Router();

//* Route for JSON base response API*\\
//? Route /api/v1/
Route.route('/employees').get(GetEmployees);

Route.route('/employee/add').post(AddEmployee);

Route.route('/employee/update').patch(UpdateEmployee);

Route.route('/employee/:id').delete(DelEmployeeByID).get(GetEmployeeByID);

module.exports = Route;
