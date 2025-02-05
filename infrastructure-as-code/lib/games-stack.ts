import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { NodeJsFunctionLambda } from "../modules/nodejs-function-lambda";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { awsResourceNames } from "../modules/common";
import { DynamoDbTable } from "../modules/dynamo-db-table";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import {
  HttpApiGateway,
  HttpApiGatewayRoute,
} from "../modules/http-api-gateway";
import { ServiceStackProps } from "../types/service-stack-props";

export class GamesStack extends Stack {
  readonly dynamoDbTable: TableV2;
  readonly httpApiGateway: HttpApi;

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);
    const { name, allowedOrigins, ...baseProps } = props;

    const dynamoDbTable = new DynamoDbTable(
      this,
      `${name}-${awsResourceNames().table}`,
      {
        name,
        streamEnabled: true,
        ...baseProps,
      }
    );

    const getGameFunctionName = `getGame`;
    const getGameFunction = new NodeJsFunctionLambda(
      this,
      `${getGameFunctionName}-${awsResourceNames().function}`,
      {
        name: getGameFunctionName,
        entryPath: path.join(__dirname, "../../api/src/games/get.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const createGameFunctionName = `createGame`;
    const createGameFunction = new NodeJsFunctionLambda(
      this,
      `${createGameFunctionName}-${awsResourceNames().function}`,
      {
        name: createGameFunctionName,
        entryPath: path.join(__dirname, "../../api/src/games/create.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const updateGameFunctionName = `updateGame`;
    const updateGameFunction = new NodeJsFunctionLambda(
      this,
      `${updateGameFunctionName}-${awsResourceNames().function}`,
      {
        name: updateGameFunctionName,
        entryPath: path.join(__dirname, "../../api/src/games/update.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const deleteGameFunctionName = `deleteGame`;
    const deleteGameFunction = new NodeJsFunctionLambda(
      this,
      `${deleteGameFunctionName}-${awsResourceNames().function}`,
      {
        name: deleteGameFunctionName,
        entryPath: path.join(__dirname, "../../api/src/games/delete.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const gamesBasePath = "/games";
    const httpApiGatewayRoutes: HttpApiGatewayRoute[] = [
      {
        integrationName: getGameFunctionName,
        path: gamesBasePath,
        httpMethod: HttpMethod.GET,
        nodeJsFunction: getGameFunction.nodejsFunction,
        tableAccess: "read",
      },
      {
        integrationName: createGameFunctionName,
        path: gamesBasePath,
        httpMethod: HttpMethod.POST,
        nodeJsFunction: createGameFunction.nodejsFunction,
        tableAccess: "write",
      },
      {
        integrationName: updateGameFunctionName,
        path: gamesBasePath,
        httpMethod: HttpMethod.PUT,
        nodeJsFunction: updateGameFunction.nodejsFunction,
        tableAccess: "readWrite",
      },
      {
        integrationName: deleteGameFunctionName,
        path: gamesBasePath,
        httpMethod: HttpMethod.DELETE,
        nodeJsFunction: deleteGameFunction.nodejsFunction,
        tableAccess: "readWrite",
      },
    ];

    const httpApiGateway = new HttpApiGateway(
      this,
      `${name}-${awsResourceNames().apigw}`,
      {
        name,
        allowedOrigins,
        allowedMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.OPTIONS,
        ],
        httpApiGatewayRoutes,
        ...baseProps,
      }
    );

    dynamoDbTable.grantAccessesToTable(httpApiGatewayRoutes);

    this.dynamoDbTable = dynamoDbTable.tableV2;
    this.httpApiGateway = httpApiGateway.httpApiGateway;
  }
}
