import { Stack } from "aws-cdk-lib";
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

export class VotesStack extends Stack {
  readonly dynamoDbTable: TableV2;
  readonly httpApiGatewayRoutes: HttpApiGatewayRoute[];

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);
    const { name, allowedOrigins, functionDir, ...baseProps } = props;
    const functionPath = `${API_BASE_PATH}/${functionDir}`;

    const dynamoDbTable = new DynamoDbTable(
      this,
      `${name}-${awsResourceNames().table}`,
      {
        name,
        streamEnabled: true,
        ...baseProps,
      }
    );

    const getVoteFunctionName = `${name}-${FUNCTION_ACTION.get}`;
    const getVoteFunction = new NodeJsFunctionLambda(
      this,
      `${getVoteFunctionName}-${awsResourceNames().function}`,
      {
        name: getVoteFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.get}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const getVotesFunctionName = `${name}-${FUNCTION_ACTION.getList}`;
    const getVotesFunction = new NodeJsFunctionLambda(
      this,
      `${getVotesFunctionName}-${awsResourceNames().function}`,
      {
        name: getVotesFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.getList}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const createVoteFunctionName = `${name}-${FUNCTION_ACTION.create}`;
    const createVoteFunction = new NodeJsFunctionLambda(
      this,
      `${createVoteFunctionName}-${awsResourceNames().function}`,
      {
        name: createVoteFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.create}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const updateVoteFunctionName = `${name}-${FUNCTION_ACTION.update}`;
    const updateVoteFunction = new NodeJsFunctionLambda(
      this,
      `${updateVoteFunctionName}-${awsResourceNames().function}`,
      {
        name: updateVoteFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.update}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const deleteVoteFunctionName = `${name}-${FUNCTION_ACTION.delete}`;
    const deleteVoteFunction = new NodeJsFunctionLambda(
      this,
      `${deleteVoteFunctionName}-${awsResourceNames().function}`,
      {
        name: deleteVoteFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.delete}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const deleteAllVotesFunctionName = `${name}-${FUNCTION_ACTION.deleteAll}`;
    const deleteAllVotesFunction = new NodeJsFunctionLambda(
      this,
      `${deleteAllVotesFunctionName}-${awsResourceNames().function}`,
      {
        name: deleteAllVotesFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.deleteAll}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const mockVotesFunctionName = `${name}-${FUNCTION_ACTION.mock}`;
    const mockVotesFunction = new NodeJsFunctionLambda(
      this,
      `${mockVotesFunctionName}-${awsResourceNames().function}`,
      {
        name: mockVotesFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.mock}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const votesBasePath = "/votes";
    const httpApiGatewayRoutes: HttpApiGatewayRoute[] = [
      {
        integrationName: getVoteFunctionName,
        path: `${votesBasePath}/{userId}`,
        httpMethod: HttpMethod.GET,
        nodeJsFunction: getVoteFunction.nodejsFunction,
        tableAccess: "read",
        authorizer: "user",
      },
      {
        integrationName: getVotesFunctionName,
        path: votesBasePath,
        httpMethod: HttpMethod.GET,
        nodeJsFunction: getVotesFunction.nodejsFunction,
        tableAccess: "read",
        authorizer: "admin",
      },
      {
        integrationName: createVoteFunctionName,
        path: votesBasePath,
        httpMethod: HttpMethod.POST,
        nodeJsFunction: createVoteFunction.nodejsFunction,
        tableAccess: "write",
        authorizer: "user",
      },
      {
        integrationName: updateVoteFunctionName,
        path: votesBasePath,
        httpMethod: HttpMethod.PUT,
        nodeJsFunction: updateVoteFunction.nodejsFunction,
        tableAccess: "readWrite",
        authorizer: "user",
      },
      {
        integrationName: deleteVoteFunctionName,
        path: `${votesBasePath}/{userId}`,
        httpMethod: HttpMethod.DELETE,
        nodeJsFunction: deleteVoteFunction.nodejsFunction,
        tableAccess: "readWrite",
        authorizer: "user",
      },
      {
        integrationName: deleteAllVotesFunctionName,
        path: `${votesBasePath}/all`,
        httpMethod: HttpMethod.DELETE,
        nodeJsFunction: deleteAllVotesFunction.nodejsFunction,
        tableAccess: "readWrite",
        authorizer: "admin",
      },
      {
        integrationName: mockVotesFunctionName,
        path: `${votesBasePath}/mock`,
        httpMethod: HttpMethod.POST,
        nodeJsFunction: mockVotesFunction.nodejsFunction,
        tableAccess: "read",
        authorizer: "admin",
      },
    ];

    dynamoDbTable.grantAccessesToTable(httpApiGatewayRoutes);

    this.dynamoDbTable = dynamoDbTable.tableV2;
    this.httpApiGatewayRoutes = httpApiGatewayRoutes;
  }
}
