const express = require('express');

const {
  encryptAPI,
  decryptAPI,
  SecAddEmployee,
  SecGetEmployeeByID,
  SecUpdateEmployee,
  SecDelEmployeeByID,
} = require('../controllers/APIv2_SecureFunctions');

const Route = express.Router();

//* Route for JSON base response API*\\
//? Route /api/v2/
Route.route('/employee/add').post(SecAddEmployee);

Route.route('/employee/update').post(SecUpdateEmployee);

Route.route('/employee/:id').delete(SecDelEmployeeByID).get(SecGetEmployeeByID);

Route.route('/encreq').post(encryptAPI);

Route.route('/decreq').post(decryptAPI);

module.exports = Route;
