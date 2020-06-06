'use strict';
const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const URL_TABLE = process.env.URL_TABLE;
exports.linkshortener = async function(event, context, callback) {
    const bodyparams = JSON.parse(event.body);
    const item = {}
          item.pk = bodyparams.Short_URL
          item.sk = "URL"
    const params = {
        TableName: URL_TABLE,
        Item: item
    };

    return await dynamo
    .put(params)
    .promise()
    .then((result) => {
        return item;
    }, (error) => {
        throw error;
    });
}