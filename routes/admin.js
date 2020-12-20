const express = require('express');

const {
  GetAPIlog,
  AddUser,
  UpdateUser,
  UserStatus
} = require('../controllers/AdminFunctions');

const Route = express.Router();

//Route for  API admin
//? Route /apiadmin/
Route.route('/logs').get(GetAPIlog);
Route.route('/createUser').post(AddUser);
Route.route('/updateUser').post(UpdateUser);
Route.route('/UserStatus').post(UserStatus);

module.exports = Route;
