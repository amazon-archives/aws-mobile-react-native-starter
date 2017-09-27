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
import { AsyncStorage } from 'react-native';

let queue = Promise.resolve();

const queueSetItem = async (v) => {
  await queue;

  queue = AsyncStorage.setItem('app-data', JSON.stringify(v), e => e && console.warn('QUEUE', e));
};

/**
 * In-Memory storage backed up by React Native's AsyncStorage
 */
class MemoryStorage {
  constructor() {
    this.obj = {};
  }

  /**
   * Synchronizes this MemoryStorage with React Native's AsyncStorage
   */
  async init() {
    await new Promise((resolve, reject) => {
      AsyncStorage.getItem('app-data', (e, r) => {
        if (e) {
          reject(e);
        } else {
          this.obj = r ? JSON.parse(r) : this.obj;
          resolve(this.obj);
        }
      });
    });
  }

  /**
   * Stores an item in the local storage
   *
   * @param {string} key 
   * @param {string} value 
   * @returns {string}
   */
  setItem(key, value) {
    console.log('SET', key);
    this.obj[key] = value;

    queueSetItem(this.obj);

    return this.obj[key];
  }

  /**
   * Retrieves an item from the local storage
   *
   * @param {string} key 
   * @returns {string}
   */
  getItem(key) {
    console.log('GET', key);
    return Object.prototype.hasOwnProperty.call(this.obj, key) ? this.obj[key] : undefined;
  }

  /**
   * Removes an item from local storage
   *
   * @param {string} key 
   */
  removeItem(key) {
    console.log('REMOVE', key);
    delete this.obj[key];

    queueSetItem(this.obj);
    return true;
  }

  /**
   * Clears the app local storage
   */
  clear() {
    AsyncStorage.clear('app-data', console.log);
    this.obj = {};
  }
}

export default new MemoryStorage();
