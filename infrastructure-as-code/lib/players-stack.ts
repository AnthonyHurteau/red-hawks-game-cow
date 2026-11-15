import { custom_resources, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { NodeJsFunctionLambda } from "../modules/nodejs-function-lambda";
import { HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { awsResourceNames } from "../modules/common";
import { DynamoDbTable } from "../modules/dynamo-db-table";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { ServiceStackProps } from "../types/service-stack-props";
import {
  API_BASE_PATH,
  FILE_EXTENSION,
  FUNCTION_ACTION,
} from "../constants/functions";
import { HttpApiGatewayRoute } from "../types/http-api-gateway-route";
import { dataInit } from "../dynamo-db-seed-data/seed";

export class PlayersStack extends Stack {
  readonly dynamoDbTable: TableV2;
  readonly httpApiGatewayRoutes: HttpApiGatewayRoute[];

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);
    const { name, functionDir, ...baseProps } = props;
    const functionPath = `${API_BASE_PATH}/${functionDir}`;

    const dynamoDbTable = new DynamoDbTable(
      this,
      `${name}-${awsResourceNames().table}`,
      {
        name,
        ...baseProps,
      }
    );

    // Seed data for core players
    new custom_resources.AwsCustomResource(
      this,
      `${name}-${awsResourceNames().table}-seed-data`,
      {
        onCreate: {
          service: "DynamoDB",
          action: "batchWriteItem",
          parameters: {
            RequestItems: {
              [dynamoDbTable.tableV2.tableName]: dataInit,
            },
          },
          physicalResourceId: custom_resources.PhysicalResourceId.of(
            Date.now().toString()
          ),
        },
        policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
          resources: [dynamoDbTable.tableV2.tableArn],
        }),
      }
    );

    const getPlayerFunctionName = `${name}-${FUNCTION_ACTION.get}`;
    const getPlayerFunction = new NodeJsFunctionLambda(
      this,
      `${getPlayerFunctionName}-${awsResourceNames().function}`,
      {
        name: getPlayerFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.get}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const createPlayerFunctionName = `${name}-${FUNCTION_ACTION.create}`;
    const createPlayerFunction = new NodeJsFunctionLambda(
      this,
      `${createPlayerFunctionName}-${awsResourceNames().function}`,
      {
        name: createPlayerFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.create}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const updatePlayerFunctionName = `${name}-${FUNCTION_ACTION.update}`;
    const updatePlayerFunction = new NodeJsFunctionLambda(
      this,
      `${updatePlayerFunctionName}-${awsResourceNames().function}`,
      {
        name: updatePlayerFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.update}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const deletePlayerFunctionName = `${name}-${FUNCTION_ACTION.delete}`;
    const deletePlayerFunction = new NodeJsFunctionLambda(
      this,
      `${deletePlayerFunctionName}-${awsResourceNames().function}`,
      {
        name: deletePlayerFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.delete}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const playersBasePath = "/players";
    const httpApiGatewayRoutes: HttpApiGatewayRoute[] = [
      {
        integrationName: getPlayerFunctionName,
        path: playersBasePath,
        httpMethod: HttpMethod.GET,
        nodeJsFunction: getPlayerFunction.nodejsFunction,
        tableAccess: "read",
        authorizer: "user",
      },
      {
        integrationName: createPlayerFunctionName,
        path: playersBasePath,
        httpMethod: HttpMethod.POST,
        nodeJsFunction: createPlayerFunction.nodejsFunction,
        tableAccess: "write",
        authorizer: "admin",
      },
      {
        integrationName: updatePlayerFunctionName,
        path: playersBasePath,
        httpMethod: HttpMethod.PUT,
        nodeJsFunction: updatePlayerFunction.nodejsFunction,
        tableAccess: "readWrite",
        authorizer: "admin",
      },
      {
        integrationName: deletePlayerFunctionName,
        path: `${playersBasePath}/{id}`,
        httpMethod: HttpMethod.DELETE,
        nodeJsFunction: deletePlayerFunction.nodejsFunction,
        tableAccess: "readWrite",
        authorizer: "admin",
      },
    ];

    dynamoDbTable.grantAccessesToTable(httpApiGatewayRoutes);

    this.dynamoDbTable = dynamoDbTable.tableV2;
    this.httpApiGatewayRoutes = httpApiGatewayRoutes;
  }
}
