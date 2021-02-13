const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
  host : 'raje.tech',
  port : 6379
});
const getCacheAsync = promisify(client.get).bind(client);
const setCacheAsync = promisify(client.set).bind(client);

module.exports = {getCacheAsync , setCacheAsync};