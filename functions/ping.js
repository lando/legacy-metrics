import DebugModule from 'debug';
const debug = new DebugModule('@lando/metrics');

const handler = async () => {
  debug('ping pong');
  return {
    statusCode: 200,
    body: JSON.stringify({ping: 'pong'}),
  };
};

export {handler};
