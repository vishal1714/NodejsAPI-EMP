const express = require('express');

const {
  GetAPIlog,
  AddUser,
  UpdateUser,
  UserStatus,
  AccountActivation,
  EmailLogs,
} = require('../controllers/AdminFunctions');

const Route = express.Router();

//Route for  API admin
//? Route /api/
Route.route('/activation').get(AccountActivation);
Route.route('/admin/logs').get(GetAPIlog);
Route.route('/admin/EmailLogs').post(EmailLogs);
Route.route('/admin/createUser').post(AddUser);
Route.route('/admin/updateUser').post(UpdateUser);
Route.route('/admin/UserStatus').post(UserStatus);

module.exports = Route;
