const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const colors = require('colors');
const bodyParser = require('body-parser');

dotenv.config({ path: './config/config.env' });
const ConnectDB = require('./config/db');

ConnectDB();

const app = express();
app.use(express.json());

if (process.env.NODE_ENV == 'Development') {
  app.use(morgan('dev'));
}
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, resp, next) => {
  resp.setHeader('Access-Control-Allow-Headers', '*');
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.removeHeader('X-Powered-By', '*');
  resp.removeHeader('Server', '*');
  resp.removeHeader('Date', '*');
  next();
});

//Web reander Route
const webroute = require('./routes/web');
app.use('/', webroute);

// Employee API Route
const route = require('./routes/index');
app.use('/api/v1', route);

//Admin APIRoute
const adminroute = require('./routes/admin');
app.use('/apiadmin', adminroute);

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
  console.log(
    `Server Started in ${process.env.NODE_ENV} mode on Port ${PORT}`.white.bold
  )
);
