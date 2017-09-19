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
