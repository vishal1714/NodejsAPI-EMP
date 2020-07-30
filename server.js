const dotenv = require("dotenv");
const colors = require("colors");
const app = require("./app");

dotenv.config({ path: "./config/config.env" });

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log("Server Started in  Dev mode on Port 5000".yellow.bold)
);
