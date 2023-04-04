'use strict';
import {init, track} from '@amplitude/analytics-node';
import * as Promise from 'bluebird';
import DebugModule from 'debug';
const debug = new DebugModule('@lando/metrics');

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

  async report(data) {
    const userProperties = {
      device_id: data.instance,
      event_type: data.action,
      os_name: data.os.platform,
      os_version: data.os.release,
      platform: data.mode,
      app_version: data.version,
    };
    const result = await track(data.action, data, userProperties).promise;
    debug('amplitude request status is %s', result.code);
    debug('amplitude request event is %s', result.event);
    debug('amplitude request is %s', result);
  };

  close() {
  };
}

