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
