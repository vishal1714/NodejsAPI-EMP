const express = require('express');
const {
  GetRenderEmployees,
  AddRenderEmployee,
  UpdateRenderEmployee,
  DelRenderEmployeeByID,
  encryptAPI,
} = require('../controllers/EmpRenderFunctions');

const Route = express.Router();

//* Route for Web Application *\\

Route.route('/').get(GetRenderEmployees);
Route.route('/add').post(AddRenderEmployee);
Route.route('/update').post(UpdateRenderEmployee);
Route.route('/del/:id').get(DelRenderEmployeeByID);
Route.route('/encrypt').post(encryptAPI);

Route.get('/employee', (req, res) => {
  res.render('employee');
});

module.exports = Route;
