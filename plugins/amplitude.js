'use strict';
import {init, track} from '@amplitude/analytics-node';
const Promise = require('bluebird');

class Amplitude {
  constructor({apiKey}) {
    this.apiKey = apiKey;
    init(apiKey);
  };

  /*
   * Ping connection.
   */
  ping() {
    return Promise.resolve(true);
  };

  report(data) {
    data.device_id = data.instance;
    track(data.action, data);
  };

  close() {
  };
}

/*
 * Return the class
 */
module.exports = Amplitude;
