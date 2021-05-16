const redis = require("redis");
const { promisify } = require("util");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/Config.env" });

try {
  const client = redis.createClient({
    host: process.env.REDIS_CACHE_URL,
    port: 6379,
  });
  var getCacheAsync = promisify(client.get).bind(client);
  var setCacheAsync = promisify(client.set).bind(client);
  console.log("Redis Server Connected".green.bold);
} catch (error) {
  console.log("Redis Server Error".red.bold + error);
}

module.exports = { getCacheAsync, setCacheAsync };
