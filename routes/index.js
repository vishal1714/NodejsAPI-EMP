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
Route.route('/employee')
  .get(GetEmployees)
  .post(AddEmployee)
  .patch(UpdateEmployee);

Route.route('/employee/:id').delete(DelEmployeeByID).get(GetEmployeeByID);

module.exports = Route;
