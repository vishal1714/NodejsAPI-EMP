const express = require('express');
const {
  AddEmployee,
  GetEmployeeByID,
  GetEmployees,
  UpdateEmployee,
  DelEmployeeByID,
  GetEmployeelog,
} = require('../controllers/EmpFunctions');

const Route = express.Router();

//* Route for JSON base response API*\\
Route.route('/employees').get(GetEmployees);

Route.route('/addemployee').post(AddEmployee);

Route.route('/updateemployee').patch(UpdateEmployee);

Route.route('/employee/:id').delete(DelEmployeeByID).get(GetEmployeeByID);

Route.route('/api/v1/empadmin').get(GetEmployeelog);

module.exports = Route;
