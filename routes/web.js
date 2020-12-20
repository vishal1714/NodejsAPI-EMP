const express = require('express');
const {
  GetRenderEmployees,
  AddRenderEmployee,
  UpdateRenderEmployee,
  DelRenderEmployeeByID,
  GetRenderEmployeeByID,
  encryptAPI,
  decryptAPI,
} = require('../controllers/WebRenderFunctions');

const Route = express.Router();

//* Route for Web Application *\\
//? Route /
Route.route('/').get(GetRenderEmployees);

Route.route('/get/:id').get(GetRenderEmployeeByID);

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
