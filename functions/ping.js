const debug = require('debug')('@lando/metrics');

exports.handler = async () => {
  debug('ping pong');
  return {
    statusCode: 200,
    body: JSON.stringify({ping: 'pong'}),
  };
};
