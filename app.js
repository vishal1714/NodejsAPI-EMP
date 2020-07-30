const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const colors = require('colors');
const ConnectDB = require('./config/db');

dotenv.config({ path: './config/config.env' });

ConnectDB();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const route = require('./routes/index');
app.use('/api/v1/employee/', route);

// Error handling 🔥
app.use((req, resp, next) => {
  var error = new Error('Not Found ⛔ ');
  error.status = 404;
  next(error);
});

app.use((error, req, resp, next) => {
  resp.status(error.status || 500);
  resp.json({
    Error: {
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log('Server Started in Dev mode on Port 5000'.yellow.bold)
);
