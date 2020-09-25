const express = require('express');

const {
  encryptAPI,
  decryptAPI,
  SecAddEmployee,
  SecGetEmployeeByID,
  SecUpdateEmployee,
  SecDelEmployeeByID,
} = require('../controllers/EmpSecureFunctions');

const Route = express.Router();

//* Route for JSON base response API*\\

Route.route('/addemployee').post(SecAddEmployee);

Route.route('/updateemployee').post(SecUpdateEmployee);

Route.route('/employee/:id').delete(SecDelEmployeeByID).get(SecGetEmployeeByID);

Route.route('/encreq').post(encryptAPI);

Route.route('/decreq').post(decryptAPI);

module.exports = Route;
