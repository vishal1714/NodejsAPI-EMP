const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });


const ConnectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGOURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    const host = mongoose.connection.host;
    console.log('MongoDB Connected :'.yellow.bold + host.green.bold);
  } catch (err) {
    console.log('MongoDB Connection Failed :'.red.bold + err.red.bold);
    process.exit(1);
  }
};

module.exports = ConnectDB;
