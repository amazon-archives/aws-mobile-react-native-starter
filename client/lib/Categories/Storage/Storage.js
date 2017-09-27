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
import { S3 } from 'aws-sdk';
import awsmobile from '../../../aws-exports';

let s3Client = null;

const getClient = () => {
  if (!s3Client) {
    s3Client = new S3({
      region: awsmobile.aws_user_files_s3_bucket_region,
    });
  }

  return s3Client;
};

const Bucket = awsmobile.aws_user_files_s3_bucket;

const Storage = {

  /**
   * Stores and object in Amazon S3.
   *
   * @param {string} Key Unique identifier for the object within the bucket
   * @param {Promise<Buffer>} content Content of the object to be uploaded
   * @param {string} ContentType Content type of uploaded object
   * @returns {Promise} Promise resolved to the uploaded object information
   */
  putObject(Key, content, ContentType) {
    return Promise.resolve(content).then(Body => new Promise((resolve, reject) => {
      getClient().upload({
        Bucket,
        Key,
        Body,
        ContentType,
      }, (err, data) => (err ? reject(err) : resolve(data)));
    }));
  },

  /**
   * Returns a Url for the given object key
   *  
   * @param {string} Key 
   * @returns {string} Url to object
   */
  getObjectUrl(Key) {
    return getClient().getSignedUrl('getObject', { Bucket, Key });
  },

};

export default Storage;
