'use strict';
import {init, track} from '@amplitude/analytics-node';

export default class AmplitudeReporter {
  constructor({apiKey}) {
    this.apiKey = apiKey;
    init(apiKey, {flushQueueSize: 0, flushIntervalMillis: 100});
  };

  /*
   * Ping connection.
   */
  ping() {
    return Promise.resolve(true);
  };

  report(data) {
    const userProperties = {
      device_id: data.instance,
      event_type: data.action,
      os_name: data.os.platform,
      os_version: data.os.release,
      platform: data.mode,
      app_version: data.version,
    };
    return Promise.resolve().then(() => {
      return track(data.action, data, userProperties).promise;
    });
  };

  close() {
  };
}

