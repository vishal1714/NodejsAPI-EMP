const cron = require('node-cron');
const amqp = require('amqplib/callback_api');
const dotenv = require('dotenv');
const moment = require('moment-timezone');
const EmployeeAPILog = require('../models/APILogSchema');
dotenv.config({ path: '../config/Config.env' });

cron.schedule('*/5 * * * *', function () {
  var date = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
  console.log(`--------------------- Cron Job Running --------------------`);
  console.log(`Date & Time - ${date} `);
  ReceiverMQ('APILog', EmployeeAPILog);
});

const SendMQ = (Queue, msg) => {
  amqp.connect(process.env.RabbitMQ_URL, function (error0, conn) {
    if (error0) {
      throw error0;
    }
    conn.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var Message = JSON.stringify(msg);
      channel.assertQueue(Queue, {
        durable: false,
      });
      channel.sendToQueue(Queue, Buffer.from(Message));
      setTimeout(function () {
        conn.close();
      }, 500);
    });
  });
};

const ReceiverMQ = (Queue, MongoSchemaObject) => {
  amqp.connect(process.env.RabbitMQ_URL, function (error0, conn) {
    if (error0) {
      throw error0;
    }
    conn.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertQueue(Queue, {
        durable: false,
      });
      var i = 0;
      channel.consume(
        Queue,
        (msg) => {
          const Message = JSON.parse(msg.content.toString());
          const test = MongoSchemaObject.create(Message);
          i++;
        },
        {
          noAck: true,
        }
      );
      setTimeout(function () {
        conn.close();
        console.log(`MQ Receiver Processed Requests => ${i}`);
      }, 20000);
    });
  });
};

module.exports = { SendMQ, ReceiverMQ };
