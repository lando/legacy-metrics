'use strict';
import {init, track} from '@amplitude/analytics-node';
import * as Promise from 'bluebird';

export default class AmplitudeReporter {
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

