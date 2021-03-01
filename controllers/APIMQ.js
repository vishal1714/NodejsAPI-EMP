const amqp = require('amqplib/callback_api');
const dotenv = require('dotenv');
dotenv.config({ path: '../config/Config.env' });

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
        durable: true,
      });
      var properties = channel.CreateBasicProperties();
      properties.SetPersistent(true);
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
        durable: true,
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
        console.log(`MQ Receiver Processed ${i} Requests`);
      }, 20000);
    });
  });
};

module.exports = { SendMQ, ReceiverMQ };
