import DebugModule from 'debug';
const debug = new DebugModule('@lando/metrics');
import _ from 'lodash';

const handler = async event => {
  const pathParts = event.path.split('/');
  const status = (_.last(pathParts) === 'status') ? 'ok' : _.last(pathParts);
  debug('status is %s', status);
  return {
    statusCode: 200,
    body: JSON.stringify({status}),
  };
};

export {handler};
