const express = require('express');
const {
  GetRenderEmployees,
  AddRenderEmployee,
  UpdateRenderEmployee,
  DelRenderEmployeeByID,
  encryptAPI,
  decryptAPI,
} = require('../controllers/EmpRenderFunctions');

const Route = express.Router();

//* Route for Web Application *\\
//? Route /
Route.route('/').get(GetRenderEmployees);

Route.route('/addemployee')
  .post(AddRenderEmployee)
  .get((req, res) => {
    res.render('addemployee');
  });
Route.route('/updateemployee')
  .post(UpdateRenderEmployee)
  .get((req, res) => {
    res.render('updateemployee');
  });

Route.route('/del/:id').get(DelRenderEmployeeByID);

Route.route('/encrypt').post(encryptAPI);

Route.route('/decrypt').post(decryptAPI);

Route.get('/encdec', (req, res) => {
  res.render('encdec');
});

module.exports = Route;
