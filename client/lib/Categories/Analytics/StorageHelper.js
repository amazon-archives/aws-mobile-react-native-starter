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
import LocalStorage from '../LocalStorage';

const NOOP = () => { };

export default class RNStorage {
  type = 'RN_ASYNC_STORAGE';

  logger = {
    log: NOOP,
    info: NOOP,
    warn: NOOP,
    error: NOOP
  };

  get(k) {
    return LocalStorage.getItem(k);
  }

  set(k, v) {
    return LocalStorage.setItem(k, v);
  }

  delete(k) {
    return LocalStorage.removeItem(k);
  }

  each(callback) {
    return LocalStorage.getAllKeys().forEach(k => callback(k, LocalStorage.getItem(k)));
  }

  setLogger(logger) {
    this.logger = logger;
  }
}