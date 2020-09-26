const express = require('express');

const {
  GetEmployeelog,
  AddKey,
  UpdateKey,
} = require('../controllers/EmpAdmin');

const Route = express.Router();

//Route for  API admin
//? Route /apiadmin/
Route.route('/log').get(GetEmployeelog);
Route.route('/createKey').post(AddKey);
Route.route('/updateKey').post(UpdateKey);

module.exports = Route;
