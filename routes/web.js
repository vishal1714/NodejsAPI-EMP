const express = require('express');
const {
  GetRenderEmployees,
  AddRenderEmployee,
  UpdateRenderEmployee,
  DelRenderEmployeeByID,
} = require('../controllers/EmpRenderFunctions');

const Route = express.Router();

//* Route for Web Application *\\

Route.route('/').get(GetRenderEmployees);
Route.route('/add').post(AddRenderEmployee);
Route.route('/update').post(UpdateRenderEmployee);
Route.route('/del').get(DelRenderEmployeeByID);

module.exports = Route;
