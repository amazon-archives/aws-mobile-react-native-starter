# AWS Mobile React Native Starter App - Serverless Pet Tracker

Bootstrap a React Native application on AWS. This starter automatically provisions a Serverless infrastructure with authentication, authorization, image storage, API access and database operations. It also includes user registration and MFA support. The sample use case is a "Pet Tracker" where after a user registers and logs in they can upload pictures of their pet to the system along with information like the birthday or breed.

A companion blog post for this repository can be found in the AWS Mobile Blog: [Announcing: React Native Starter Project with One-Click AWS Deployment and Serverless Infrastructure](https://aws.amazon.com/blogs/mobile/announcing-react-native-starter-project-with-one-click-aws-deployment-and-serverless-infrastructure/). 

### Quicklinks
 - [Getting started](#getstarted)
 - [Using Registration and Login components in your app](#advanced-auth)
 - [Accessing Cloud APIs with REST](#restclient)
 - [Storing images, video and other content in the cloud](#storage)
 - [Modifying Cloud Logic with Lambda for your app](#lambdamodify)

## Architecture Overview
![Architecture](media/architecture.png)

AWS Services used:
* Amazon Cognito User Pools
* Amazon Cognito Federated Identities
* Amazon API Gateway
* AWS Lambda
* Amazon DynamoDB
* Amazon S3
* Amazon Pinpoint
* AWS Mobile Hub

## Prerequisites
- AWS Account
- [Xcode](https://developer.apple.com/xcode/) / [Android Studio](https://developer.android.com/studio/index.html)
- [Node.js](https://nodejs.org/) with NPM 
  - `npm install -g react-native-cli`
  - `npm install -g create-react-native-app`
- (_Optional_) [Watchman](https://facebook.github.io/watchman/)
  - On macOS, it is recommended to install it using [Homebrew](https://brew.sh/)
    - `brew install watchman`
- (_Optional_) [AWS CLI](https://aws.amazon.com/cli/)  

## Getting Started <a name="getstarted"></a>

First clone this repo: `git clone https://github.com/awslabs/aws-mobile-react-native-starter`

## Backend Setup
1. Set up your AWS resources using AWS Mobile Hub by clicking the button below:

<p align="center">
  <a target="_blank" href="https://console.aws.amazon.com/mobilehub/home?#/?config=https://github.com/awslabs/aws-mobile-react-native-starter/blob/master/backend/import_mobilehub/reactnative-starter.zip">
    <span>
        <img height="100%" src="https://s3.amazonaws.com/deploytomh/button-deploy-aws-mh.png"/>
    </span>
  </a>
</p>

2. Press **Import project**

## Client Setup

![Alt Text](media/console.gif)

1. Before proceeding further, in the Mobile Hub console click the **Cloud Logic** tile and ensure that the API deployment status at the bottom shows **CREATE_COMPLETE** (_this can take a few moments_).

2. Click **Configure** on the left hand bar of the console and select the **Hosting and Streaming tile**.


3. At the bottom of the page click **Download aws-exports.js file**. Copy this file into the `./aws-mobile-react-native-starter/client` folder of the repo you cloned.

   * _Alternatively using the AWS CLI_:

     ```
     $ cd ../aws-mobile-react-native-starter/client
     $ aws s3api list-buckets --query 'Buckets[?starts_with(Name,`reactnativestarter-hosting`)].Name' |grep reactnativestarter |tr -d '"'
     $ aws s3api get-object --bucket <YOUR_BUCKET_NAME> --key aws-exports.js ./aws-exports.js
     ```

5. Navigate into  `./aws-mobile-react-native-starter/client`  and run:

   ```
   $ npm install
   $ npm run ios #npm run android
   ```

 Done!

## Application walkthrough

1. On a phone or emulator/simulator, open the application
2. Select the **SIGN UP** tab in the lower right to register a new user. You will be prompted to enter a valid email and phone number to confirm your registration.
3. Click **Sign Up** and you will recieve a code via SMS. Enter this into the prompt and press **OK**.
3. From the **Sign In** tab of the application enter the _Username_ and _Password_ of the user you just registered and select **SIGN IN**.
4. A code will be sent via SMS. Enter that code in the prompt and press **OK**.

5. Press the plus (+) button to upload a photo. After selecting a photo select the **Check mark**.
6. Fill out a few details like the name, birthday, breed and gender of your pet. Press **Add Pet** to upload the photo. This will first transfer the photo to an S3 bucket which only the logged-in user has access to, it will then write the record to a DynamoDB table (via API Gateway and Lambda) that is also restricted on a per-user basis.

![Add Pet](media/Nadia1.png)

6. You will see a record of your pet on the homescreen.

![My Pets](media/Nadia2.png)

## Use features in your app.

This starter app includes a set of libraries (under `client/lib`) to help you integrate features into your own React Native app. These libraries include helpers, React [Higher Order Components](https://facebook.github.io/react/docs/higher-order-components.html) that you can use to easily add capabilities for Sign-Up, Sign-In or API Access with basic reusable React Components through `Auth`, `API`, `Analytics` and `Storage` HOCs.

You will need [Create React Native App](https://github.com/react-community/create-react-native-app) for the next sections.

- Create a new React Native App (CRNA) using `create-react-native-app`
- `cd` into your new app dir.
- Eject your react native app (in our examples call it "myapp")
```sh
create-react-native-app <project-directory>
cd <project-directory>
npm run eject # Eject as "React Native"
```
- Download the `aws-exports.js` file from your AWS MobileHub project as outlined earlier in the [Getting started](#getstarted) section. Place it in the root of your new CRNA directory.

- Copy `lib` folder from this starter app  
`cp -rf ../<some-directory>/aws-react-native-native-starter/client/lib .`

### Sign-up and Sign-In <a name="advanced-auth"></a>

1. Install dependencies with `npm install`

2. Install additional dependencies:

```npm install aws-sdk react-native-aws-cognito-js react-native-prompt --save```

3. Link the native components by running: `react-native link`

4. Open the `App.js` file.

5. Import the `WithAuth` HOC from the library
```javascript
import { WithAuth } from './lib/Categories/Auth/Components';
```

This HOC will add a prop called `session` to your component as well as a method called `doSignOut()`. There is also a wrapper class called `Auth` as part of this which is a helper for common Sign-Up and Sign-In activities. We'll show you how to use the `session` and `doSignOut()` capabilities next.

6. Edit your App component to transform it into one that supports `Auth`  
```javascript
export default WithAuth(class App extends React.Component {
  // ...
});
```

7. Import the React Native Button component
```javascript
import { StyleSheet, Text, View, Button } from 'react-native';
```

8. Import the SignIn/SignUp example component
```javascript
import { SignIn, SignUp } from './lib/Categories/Auth/Components/Examples';
```

9. Change your `render()` method to check if a user is signed in or out, and show SignIn/SignUp components or a SignOut button accordingly.
```jsx
render() {
  const { session } = this.props;

  return (
    session ?
      (<View style={styles.container}>
        <Button title="Sign Out" onPress={() => this.props.doSignOut()} />
      </View>)
      :
      (<View style={styles.container}>
        <SignIn {...this.props} />
        <SignUp {...this.props} />
      </View>)
  );
}
```

10. Test it!  
`npm run ios # or android`

11. You now have SignIn/SignUp/SignOut capabilities (With MFA support too!)

### Cloud APIs and Backend Access Control<a name="restclient"></a>
In order to access resources in your AWS account that are protected via AWS [Identity and Access Management](http://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) you will need to sign your requests using the [AWS Signature Version 4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) signing process. The starter application supports signing requests both for uploading your images to Amazon S3, as well as communicating with the backend (AWS Lambda and DynamoDB) via Amazon API Gateway. There are many different ways that [IAM Permissions can be configured to Control Access to API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/permissions.html) using credentials which we encourage you to read more about.

The starter application retrieves AWS credentials using the `WithAuth` HOC from the previous section via Amazon Cognito. This section outlines using an `API` feature which automatically uses these credentials to sign requests to Amazon API Gateway which are secured using IAM.

The following steps require the `WithAuth` section to be completed first. Please follow steps 1-9 from the earlier [Sign-Up and Sign-In](#advanced-auth) section.

1. Install additional dependencies  
`npm install aws4-react-native axios --save`

2. Import the `aws-exports.js` file
```javascript
import awsmobile from './aws-exports';
```

3. Import the `WithAuth` HOC from the library
```javascript
import { WithAPI } from './lib/Categories/API/Components';
```

4. Edit your App component to transform it into one that supports `API`  
```javascript
export default WithAPI(WithAuth(class App extends React.Component {
  // ...
}));
```

5. Add `apiResponse` to the component's initial state  
```javascript
export default WithAPI(WithAuth(class App extends React.Component {

  state = {
    apiResponse: null,
  }

  // ...
}));
```

6. Add a handler method to your component to call your API
```javascript
export default WithAPI(WithAuth(class App extends React.Component {
  // ...

  async handleCallAPI() {
    const { api } = this.props;

    // Get endpoint
    const cloudLogicArray = JSON.parse(awsmobile.aws_cloud_logic_custom);
    const endPoint = cloudLogicArray[0].endpoint;

    const requestParams = {
      method: 'GET',
      url: endPoint + '/items/pets',
    };

    let apiResponse = null;

    try {
      apiResponse = await api.restRequest(requestParams);
    } catch (err) {
      console.warn(err);
    }

    this.setState({ apiResponse });
  }

  // ...
}));
```

7. Change your `render()` method to show a button to invoke your API
```jsx
render() {
  const { session } = this.props;

  return (
    session ?
      (<View style={styles.container}>
        <Button title="Call API" onPress={this.handleCallAPI.bind(this)} />
        <Text>Response: {this.state.apiResponse && JSON.stringify(this.state.apiResponse)}</Text>
        <Button title="Sign Out" onPress={() => this.props.doSignOut()} />
      </View>)
      :
      (<View style={styles.container}>
        <SignIn {...this.props} />
        <SignUp {...this.props} />
      </View>)
  );
}
```

8. Test it!  
`npm run ios # or android`

9. You can now invoke API Gateway APIs from your React Native that are protected via AWS IAM. After you login to the application press the **Call API** button to see the JSON response returned from the network request.

### Storing content in the cloud <a name="storage"></a>
Many applications today provide rich media such as images or videos. Sometimes these are also private to users. This starter project provides a `Storage` component that allows a user to upload data, such as an image, to an Amazon S3 bucket in a folder which is protected so that only that user can access the data. This is done by setting S3 bucket policies on unique user Identities provided by Amazon Cognito. You can read more about this [here](http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_s3_cognito-bucket.html).

The `Storage` feature depends on the user to have valid credentials. The following steps require the `WithAuth` section to be completed first. Please follow steps 1-9 from the earlier [Sign-Up and Sign-In](#advanced-auth) section.


1. First, install additional dependencies  
`npm install react-native-fetch-blob buffer --save`

3. Next link the native bridge components
   - `react-native-fetch-blob` is a library to help you with data transfer on React Native. Run the following command in your terminal:
```sh
RNFB_ANDROID_PERMISSIONS=true react-native link
```

4. Import the `aws-exports.js` file if you haven't already
```javascript
import awsmobile from './aws-exports';
```

5. Import dependencies (use `App.js` from the CRNA process):
```javascript
import AWS from 'aws-sdk';
import RNFetchBlob from 'react-native-fetch-blob';
import { Buffer } from 'buffer';
```

6. Import the `WithStorage` HOC from the library
```javascript
import { WithStorage } from './lib/Categories/Storage/Components';
```

7. Import the React Native Image component
```javascript
import { StyleSheet, Text, View, Button, Image } from 'react-native';
```

8. Edit your App component to transform it into one that supports `Storage`  
```javascript
export default WithStorage(WithAuth(class App extends React.Component {
  // ...
}));
```

9. Add `objectUrl` to the component's initial state  
```javascript
export default WithStorage(WithAuth(class App extends React.Component {

  state = {
    objectUrl: null,
  }

  // ...
}));
```

10. Add a handler method to your component to upload a file to a private area for the signed in user. The sample method below shows how to download a sample PNG file of an AWS logo and upload it to the S3 bucket. Your application might get images from the camera roll on the phone (see the starter app code for examples of this).

```javascript
export default WithStorage(WithAuth(class App extends React.Component {
  // ...

  async handleUploadFile() {
    const url = 'https://awsmedia.s3.amazonaws.com/AWS_Logo_PoweredBy_127px.png';
    const [, fileName, extension] = /.*\/(.+)\.(\w+)$/.exec(url);

    // Get cognito identity for the signed in user
    const { IdentityId } = AWS.config.credentials.data;

    // File will be uploaded to the user's private space in the S3 bucket
    const key = `private/${IdentityId}/${fileName}`;

    let objectUrl = null;

    try {
      // Download file from the internet.
      const download = await RNFetchBlob.fetch('GET', url);
      const { data } = download;
      const { respInfo: { headers: { 'Content-Type': contentType } } } = download;

      // Upload the file
      const upload = await this.props.storage.putObject(key, new Buffer(data, 'base64'), contentType);

      // Get url for stored object. This is an S3 presigned url. See: http://docs.aws.amazon.com/AmazonS3/latest/dev/ShareObjectPreSignedURL.html
      objectUrl = this.props.storage.getObjectUrl(upload.key);

      console.log(objectUrl);
    } catch (err) {
      console.warn(err);
    }

    this.setState({ objectUrl });
  }

  // ...
}));
```

**Note**: The AWS Mobile Hub import process you ran at the begining created an S3 bucket with folders such as public and private. The code above creates a `key` variable for uploading to the private folder for this specific user Identitity. If you wish to make the data public you could use `const key = public/filename` as the upload location.

11. Change your `render()` method to show a button to upload the file and the uploaded image
```jsx
  render() {
    const { session } = this.props;

    return (
      session ?
        (<View style={styles.container}>
          {this.state.objectUrl && <Image source={{ uri: this.state.objectUrl }} style={{width: 200, height: 200, resizeMode: 'contain'}} />}
          <Button title="Upload file" onPress={this.handleUploadFile.bind(this)} />
          <Button title="Sign Out" onPress={() => this.props.doSignOut()} />
        </View>)
        :
        (<View style={styles.container}>
          <SignIn {...this.props} />
          <SignUp {...this.props} />
        </View>)
    );
  }
```

8. Test it!  
`npm run ios # or android`

9. You can now store objects in the Cloud on S3 from React Native using AWS IAM credentials. After you press the **Upload file** button go back into your Mobile Hub project and click the **Resources** button on the left of the console. Under the section that says **Amazon S3 Buckets** there should be one that has **userfiles** in the name. Click that and you'll see it has a folder labeled **private** which is organized by the user Identities. This will contain the images you've uploaded.



## Modifying Express routes in Lambda <a name="lambdamodify"></a>

The sample application invokes a Lambda function running [Express](https://expressjs.com) which will make CRUD operations to DynamoDB depending on the route which is passed from the client application. You may wish to modify this backend behavior for your own needs. The steps outline how you could add functionality to _"delete a Pet"_ by showing what modifications would be needed in the Lambda function and the corresponding client modifications to make the request.

1. After you have cloned this repo, locate `./aws-mobile-react-native-starter/backend/lambdas/crud/app.js` and find the following section of code:

```javascript
app.listen(3000, function () {
  console.log('App started');
});
```

1. Immediately **Before** this code (_line_72_) add in the following code:

```javascript
app.delete('/items/pets/:petId', (req, res) => {
  if (!req.params.petId) {
    res.status(400).json({
      message: 'You must specify a pet id',
    }).end();
    return;
  }

  const userId = req.apiGateway.event.requestContext.identity.cognitoIdentityId;

  dynamoDb.delete({
    TableName: PETS_TABLE_NAME,
    Key: {
      userId: userId,
      petId: req.params.petId,
    }
  }, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({
        message: 'Could not delete pet'
      }).end();
    } else {
      res.json(null);
    }
  });
});
```

2. Save the file and in the Mobile Hub console for your project click the **Cloud Logic** card. Expand the **View resource details** section and note the name of the **Lambda function** in the list for the next step. It should be something similar to **Pets-itemsHandler-mobilehub-XXXXXXXXX**.

3. In a terminal navigate to `./aws-mobile-react-native-starter/backend` and run:

```
npm run build-lambdas
aws lambda update-function-code --function-name FUNCTION_NAME --zip-file fileb://lambdas/crud-lambda.zip
```

**REPLACE the FUNCTION_NAME with your Lambda function name from the previous step.**

This might take a moment to complete based on your network connection. Please be patient.

Alternatively you could click the Lambda function resource in the Mobile Hub console which opens the Lambda console and press the **Upload** button on that page to upload the **lambdas/crud-lambda.zip** file.

5. Now that you've updated the Cloud Logic backend modify the client to call the new API route. In the `./aws-mobile-react-native-starter/client/src/Screens` directory edit `ViewPet.jsx`

  - Add the following imports
```javascript
import { Button } from 'react-native-elements';
import awsmobile from '../../aws-exports';
import API from '../../lib/Categories/API';
```

  - Add the following function **BEFORE** the **render()** method:
```javascript
  async handleDeletePet(petId) {
    const cloudLogicArray = JSON.parse(awsmobile.aws_cloud_logic_custom);
    const endPoint = cloudLogicArray[0].endpoint;
    const requestParams = {
      method: 'DELETE',
      url: `${endPoint}/items/pets/${petId}`,
    }

    try {
      await API.restRequest(requestParams);

      this.props.navigation.navigate('Home');
    } catch (err) {
      console.log(err);
    }
  }
```

  - In the `return` statement of the `render` method add in a new button after the `<View style={styles.breaker} />`:
```javascript
// ...
      <View style={styles.breaker} />
      <Button
          fontFamily='lato'
          backgroundColor={colors.red}
          large
          title="DELETE PET"
          onPress={this.handleDeletePet.bind(this, pet.petId)} />
// ...
```
6. Save the file and run the application again:

```
cd ./aws-mobile-react-native-starter/client
npm run ios # or android
```

If you have previously uploaded any pets click on their thumbnail from the main page (if not upload one now). You should see a new button **DELETE PET**. Click on it and the pet should be removed from the screen. The record should also have been removed from the DynamoDB table. You can validate this by going to the **Resources** section of your Mobile Hub project and opening up the DynamoDB table. 

## Security Information

### Remote Storage

This starter app uploads content to an S3 bucket. The S3 bucket is configured by Mobile Hub to use fine-grained access control to support public, protected and private access, you can find more information [here](http://docs.aws.amazon.com/mobile-hub/latest/developerguide/user-data-storage.html). To learn more about restricting this access further, see [Amazon S3 Security Considerations](http://docs.aws.amazon.com/mobile-hub/latest/developerguide/s3-security.html).

### Local Storage

This starter app uses React Native's [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) to persist user tokens locally (accessKeyId, secretAccessKey and sessionToken). You can take further actions to secure these tokens by encrypting them.

### API Handler Table Permissions

The Lambda function in this starter will read and write to DynamoDB and it's role will be granted the appropriate permissions to perform such actions. If you wish to modify the sample to perform a more restricted set of actions see [Authentication and Access Control for Amazon DynamoDB](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/authentication-and-access-control.html).
