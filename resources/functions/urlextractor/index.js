'use strict';
const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();

const URL_TABLE = process.env.URL_TABLE;
exports.urlextractor = async function(event, context, callback) {
    let params = {
        Key: {
            pk: event.pathParameters ? event.pathParameters.shortlinkcode : null,
            sk: "URL"
        },
        TableName: TABLE_NAME
    };

    return await dynamo
        .get(params)
        .promise()
        .then((result) => {
            return result.Item;
        }, (error) => {
            return error;
        });

  }