const cdk = require('@aws-cdk/core');
const { RestApi, LambdaIntegration } = require("@aws-cdk/aws-apigateway");
const lambda = require("@aws-cdk/aws-lambda");
const  { Table, AttributeType, BillingMode } = require('@aws-cdk/aws-dynamodb');

class CdkStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const urlTable = new Table(this, 'URL', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: {name: 'sk', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST
    });    

    // The code that defines your stack goes here
    const linkshortenerFunction = new lambda.Function(this, "linkshortener", {
      runtime: lambda.Runtime.NODEJS_12_X, // So we can use async in widget.js
      code: lambda.Code.asset("resources/functions/linkshortener"),
      handler: "index.linkshortener",
      environment: {
        URL_TABLE: urlTable.tableName
      }
    });
        // The code that defines your stack goes here
    const urlextractorFunction = new lambda.Function(this, "urlextractor", {
      runtime: lambda.Runtime.NODEJS_12_X, // So we can use async in widget.js
      code: lambda.Code.asset("resources/functions/urlextractor"),
      handler: "index.urlextractor",
      environment: {
        URL_TABLE: urlTable.tableName
      }
    });

    const api = new RestApi(this, 'api', {
      deployOptions: {
        stageName: 'dev'  
      }
    });
    /**
     * Root of the application
     */
    api.root.addMethod('ANY');
     /**
     * Createing shortlink resource in API gateway
     */
    const shortlink = api.root.addResource('shortlink');
    /**
     * Mapping lamda to APIs
     */
    shortlink.addMethod('POST', new LambdaIntegration(linkshortenerFunction));
    shortlink.addMethod('GET', new LambdaIntegration(urlextractorFunction));

    urlTable.grant(linkshortenerFunction, "dynamodb:PutItem");
    urlTable.grant(urlextractorFunction, "dynamodb:GetItem");
  }
}

module.exports = { CdkStack }
