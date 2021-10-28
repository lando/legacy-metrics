'use strict';

const _ = require('lodash');
const debug = require('debug')('@lando/metrics');
const Promise = require('bluebird');

// Load plugins
const BugsnagReporter = require('./../plugins/bugsnag.js');
const ElasticsearchReporter = require('./../plugins/elastic.js');

// Define default config
const config = {
  'LANDO_METRICS_PLUGINS': [
    {name: 'elastic', config: 'LANDO_METRICS_ELASTIC'},
    {name: 'bugsnag', config: 'LANDO_METRICS_BUGSNAG'},
  ],
};

// Get plugins
const pluginConfig = config.LANDO_METRICS_PLUGINS || [];

// Merge in plugin config keys
_.forEach(_.map(pluginConfig, plugin => plugin.config), key => {
  config[key] = {};
});

// Merge in .env file
require('dotenv').config();

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
  {name: 'elastic', Reporter: ElasticsearchReporter, config: 'LANDO_METRICS_ELASTIC'},
  {name: 'bugsnag', Reporter: BugsnagReporter, config: 'LANDO_METRICS_BUGSNAG'},
];

debug('loaded plugins %o', plugins);

exports.handler = async event => {
  // Error on anything but post requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 500,
      body: 'unrecognized HTTP Method, only POST accepted',
    };
  }

  // Get incoming data
  const pathParts = event.path.split('/');
  const id = (_.last(pathParts) === 'v2') ? undefined : _.last(pathParts);

  // Error if no id
  if (!id) return {statusCode: 500, body: 'ID is required!'};

  // Merge data
  const data = _.merge({}, JSON.parse(event.body), {id});
  debug('request recieved from %s with value %o', data.id, data);

  // Report data
  return Promise.map(plugins, plugin => {
    const reporter = new plugin.Reporter(config[plugin.config]);
    return reporter.ping()
      .then(() => reporter.report(data))
      .then(() => debug('reported to %s', plugin.name))
      .then(() => reporter.close());
  });
};
