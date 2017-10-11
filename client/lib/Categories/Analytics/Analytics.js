/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import AWS from 'aws-sdk';
import Pinpoint from 'aws-sdk/clients/pinpoint';
import AMA from 'aws-sdk-mobile-analytics';
import { Platform } from 'react-native';

import awsmobile from '../../../aws-exports';
import Auth from '../Auth';
import StorageHelper from '../Analytics/StorageHelper';

const getClient = () => {
  const platform = Platform.OS;
  const credentials = AWS.config.credentials;

  // AWS.MobileAnalytics
  return new AMA.Manager({
    storage: new StorageHelper(),
    appId: awsmobile.aws_mobile_analytics_app_id,
    platform,
    logger: console,
    clientId: credentials && credentials.identityId
  });
};

const getPPClient = () => {
  return new Pinpoint({
    region: awsmobile.aws_project_region,
    credentials: AWS.config.credentials
  });
}

const init = async () => {
  await Auth.init();
  return [await getClient(), await getPPClient()];
};

class Analytics {

  constructor() {
    this.initialized = new Promise((resolve) => {
      init().then(([client, ppClient]) => {
        const credentials = AWS.config.credentials;

        this.client = client;
        this.ppClient = ppClient;

        this.ppClient.updateEndpoint({
          EndpointId: credentials && credentials.identityId,
          ApplicationId: awsmobile.aws_mobile_analytics_app_id,
          EndpointRequest: {
            // Attributes: {
            //   myKey: 'myVal'
            // }
          }
        }, (err, data) => console.log(`Pinpoint ${err ? 'ERROR' : 'SUCCESS'}`, err || data));

        resolve();
      });
    });
  }

  async handleSessionStateChange(state = '', platform = '') {
    await this.initialized;

    const newState = state.toLowerCase();

    switch (newState) {
      case 'active':
        this.client.startSession();
        break;
      case 'inactive':
      case 'background':
        this.client.stopSession();
        break;
      default:
      // Do nothing
    }
  }

  async recordEvent(eventName, attributes = {}, metrics = {}) {
    await this.initialized;

    this.client.recordEvent(eventName, attributes, metrics)
  }
};

export default new Analytics();
