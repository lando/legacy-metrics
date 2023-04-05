'use strict';

import _ from 'lodash';
// https://github.com/debug-js/debug/issues/786#issuecomment-845927683
import DebugModule from 'debug';
const debug = new DebugModule('@lando/metrics');
// Load plugins
import AmplitudeReporter from '../plugins/amplitude.js';

// Define default config
const config = {
  'LANDO_METRICS_PLUGINS': [
    {name: 'amplitude', config: 'LANDO_METRICS_AMPLITUDE'},
  ],
};

// Get plugins
const pluginConfig = config.LANDO_METRICS_PLUGINS || [];

// Merge in plugin config keys
_.forEach(_.map(pluginConfig, plugin => plugin.config), key => {
  config[key] = {};
});

// Merge in .env file
import dotenv from 'dotenv';
dotenv.config();

// Merge in process.env as relevant
_.forEach(_.keys(config), key => {
  if (_.has(process.env, key)) {
    config[key] = process.env[key];
  }
});

// Make sure we JSON parse relevant config
_.forEach(_.map(pluginConfig, plugin => plugin.config), key => {
  if (typeof config[key] === 'string') {
    config[key] = JSON.parse(config[key]);
  }
});
debug('starting function with config %o', config);

// Manually declare plugins
const plugins = [
  {name: 'amplitude', Reporter: AmplitudeReporter, config: 'LANDO_METRICS_AMPLITUDE'},
];

debug('loaded plugins %o', plugins);

const handler = event => {
  // Get incoming data
  const pathParts = event.path.split('/');
  const id = (_.last(pathParts) === 'v2') ? undefined : _.last(pathParts);

  // Error if no id
  if (!id) return {statusCode: 500, body: 'ID is required!'};

  // Error on anything but post requests
  if (_.lowerCase(event.httpMethod) !== 'post') {
    debug('unsupported method %s from %s', event.httpMethod, id);
    return {
      statusCode: 405,
      body: 'Unsupported HTTP Method',
    };
  }

  // Merge data
  const data = _.merge({}, JSON.parse(event.body), {id});
  debug('request recieved from %s with value %o', data.id, data);
  const reporter = new AmplitudeReporter(config['LANDO_METRICS_AMPLITUDE']);

  return reporter.ping()
    .then(() => reporter.report(data))
    .then(() => debug('reported to amplitude'))
    .then(() => reporter.close())
    .then(() => ({statusCode: 200, body: JSON.stringify({status: 'OK'})}))
    // Throw error
    .catch(error => {
      debug('errored with %o', error);
      return {
        statusCode: 400,
        body: JSON.stringify(error),
      };
    });
};

export {handler};
