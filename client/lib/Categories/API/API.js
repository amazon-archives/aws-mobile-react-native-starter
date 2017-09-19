import axios from 'axios';
import aws4 from 'aws4-react-native';

import LocalStorage from '../LocalStorage';

export default {

  /**
   * Executes a REST request.
   * 
   * @param {obj} requestParams 
   */
  restRequest(requestParams) {
    const pathArray = requestParams.url.split('/');
    const host = pathArray[2];
    let path = pathArray.slice(3).join('/');
    path = `/${path}`;

    const newRequestParams = Object.assign({}, requestParams);
    newRequestParams.host = host;
    newRequestParams.path = path;

    if (LocalStorage.getItem('awsCredentials') != null) {
      const awsCredentials = JSON.parse(LocalStorage.getItem('awsCredentials'));
      const signedRequest = aws4.sign(newRequestParams,
        {
          secretAccessKey: awsCredentials.secretAccessKey,
          accessKeyId: awsCredentials.accessKeyId,
          sessionToken: awsCredentials.sessionToken,
        });

      signedRequest.data = signedRequest.body;
      delete signedRequest.body;
      delete signedRequest.headers['Host'];
      delete signedRequest.headers['Content-Length'];

      return axios(signedRequest)
        .then(response => response.data)
        .catch((error) => {
          console.log(error.response.data);
          throw error;
        });
    }

    const unsignedRequest = newRequestParams.url;
    if (newRequestParams.method === 'GET') {
      return axios.get(unsignedRequest);
    } else if (newRequestParams.method === 'POST') {
      return axios.post(unsignedRequest);
    }

    throw new Error('Invalid request params');
  },
};
