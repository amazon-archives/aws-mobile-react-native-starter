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
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const uuid = require('node-uuid');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// declare a new express app
const app = express();
app.use(awsServerlessExpressMiddleware.eventContext({ deleteHeaders: false }), bodyParser.json());

const PETS_TABLE_NAME = `${process.env.MOBILE_HUB_DYNAMIC_PREFIX}-pets`;

AWS.config.update({ region: process.env.REGION });

const UNAUTH = 'UNAUTH';

// The DocumentClient class allows us to interact with DynamoDB using normal objects.
// Documentation for the class is available here: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.get('/items/pets', (req, res) => {
  // performs a DynamoDB Query operation to extract all records for the cognitoIdentityId in the table
  dynamoDb.query({
    TableName: PETS_TABLE_NAME,
    KeyConditions: {
      userId: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH],
      },
    },
  }, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: 'Could not load pets',
      }).end();
    } else {
      res.json(data.Items).end();
    }
  });
});

app.post('/items/pets', (req, res) => {
  if (!req.body.name) {
    res.status(400).json({
      message: 'You must specify a pet name',
    }).end();
    return;
  }

  const pet = Object.assign({}, req.body);

  Object.keys(pet).forEach(key => (pet[key] === '' && delete pet[key]));

  pet.userId = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  pet.petId = uuid.v1();

  dynamoDb.put({
    TableName: PETS_TABLE_NAME,
    Item: pet,
  }, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).json({
        message: 'Could not insert pet'
      }).end();
    } else {
      res.json(pet);
    }
  });
});

app.listen(3000, function () {
  console.log('App started');
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
