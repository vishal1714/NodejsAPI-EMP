const redis = require('redis');
const { promisify } = require('util');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const client = redis.createClient({
  host: process.env.REDIS_CACHE_URL,
  port: 6379,
});
const getCacheAsync = promisify(client.get).bind(client);
const setCacheAsync = promisify(client.set).bind(client);
console.log('Redis Server Connected'.green.bold);

module.exports = { getCacheAsync, setCacheAsync };
