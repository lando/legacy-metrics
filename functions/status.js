const _ = require('lodash');
const debug = require('debug')('@lando/metrics');

exports.handler = async event => {
  const pathParts = event.path.split('/');
  const status = (_.last(pathParts) === 'status') ? 'ok' : _.last(pathParts);
  debug('status is %s', status);
  return {
    statusCode: 200,
    body: JSON.stringify({status}),
  };
};
