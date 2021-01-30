const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const colors = require('colors');
const helmet = require("helmet")
const { CreatePath } = require('./controllers/APILogManager');
const rateLimit = require("express-rate-limit");

dotenv.config({ path: './config/Config.env' });
const ConnectDB = require('./config/DB');

ConnectDB();
CreatePath(process.env.LOGDIR);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended : false}));

if (process.env.NODE_ENV == 'Dev') {
  app.use(morgan('dev'));
}
app.use(helmet())
app.set('view engine', 'ejs');

// app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 150 // limit each IP to 100 requests per windowMs
});
//  apply to all requests
app.use(limiter);

//Web render Route
if (process.env.WEBUI == 'ON') {
  const webroute = require('./routes/Web');
  app.use('/', webroute); 
}else {
  app.get("/" , (req,resp,next) => {
    resp.status(200).send("Raje Tech Solutions Employee API")
  })
}

//Admin API Route
const adminroute = require('./routes/Admin');
app.use('/api', adminroute);

// Employee API Route
const route = require('./routes/APIv1');
app.use('/api/v1', route);

// Employee Secure API Route
const secureroute = require('./routes/APIv2Secure');
app.use('/api/v2', secureroute);

// Error handling
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

//console.log = function(){};
const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server Started in ${process.env.NODE_ENV} mode on Port ${PORT}`.white.bold
  )
);
