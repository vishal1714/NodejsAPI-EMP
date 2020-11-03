const express = require('express');

const {
  GetEmployeelog,
  AddUser,
  UpdateUserKey,
  UserStatus
} = require('../controllers/EmpAdmin');

const Route = express.Router();

//Route for  API admin
//? Route /apiadmin/
Route.route('/log').get(GetEmployeelog);
Route.route('/createUser').post(AddUser);
Route.route('/updateUserKey').post(UpdateUserKey);
Route.route('/UserStatus').post(UserStatus);

module.exports = Route;
