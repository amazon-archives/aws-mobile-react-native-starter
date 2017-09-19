import RNFetchBlob from 'react-native-fetch-blob';

export default {
  readFile(filePath) {
    return RNFetchBlob.fs.readFile(filePath, 'base64').then(data => new Buffer(data, 'base64'));
  },
};
