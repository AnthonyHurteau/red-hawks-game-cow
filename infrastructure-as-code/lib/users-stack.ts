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

export class UsersStack extends Stack {
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
        ...baseProps,
      }
    );

    const getUserFunctionName = `${name}-${FUNCTION_ACTION.get}`;
    const getUserFunction = new NodeJsFunctionLambda(
      this,
      `${getUserFunctionName}-${awsResourceNames().function}`,
      {
        name: getUserFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.get}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const createUserFunctionName = `${name}-${FUNCTION_ACTION.create}`;
    const createUserFunction = new NodeJsFunctionLambda(
      this,
      `${createUserFunctionName}-${awsResourceNames().function}`,
      {
        name: createUserFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.create}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const updateUserFunctionName = `${name}-${FUNCTION_ACTION.update}`;
    const updateUserFunction = new NodeJsFunctionLambda(
      this,
      `${updateUserFunctionName}-${awsResourceNames().function}`,
      {
        name: updateUserFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.update}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const deleteUserFunctionName = `${name}-${FUNCTION_ACTION.delete}`;
    const deleteUserFunction = new NodeJsFunctionLambda(
      this,
      `${deleteUserFunctionName}-${awsResourceNames().function}`,
      {
        name: deleteUserFunctionName,
        entryPath: path.join(
          __dirname,
          `${functionPath}/${FUNCTION_ACTION.delete}.${FILE_EXTENSION}`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const usersBasePath = "/users";
    const httpApiGatewayRoutes: HttpApiGatewayRoute[] = [
      {
        integrationName: getUserFunctionName,
        path: usersBasePath,
        httpMethod: HttpMethod.GET,
        nodeJsFunction: getUserFunction.nodejsFunction,
        tableAccess: "read",
        authorizer: "none",
      },
      {
        integrationName: createUserFunctionName,
        path: usersBasePath,
        httpMethod: HttpMethod.POST,
        nodeJsFunction: createUserFunction.nodejsFunction,
        tableAccess: "write",
        authorizer: "none",
      },
      {
        integrationName: updateUserFunctionName,
        path: usersBasePath,
        httpMethod: HttpMethod.PUT,
        nodeJsFunction: updateUserFunction.nodejsFunction,
        tableAccess: "readWrite",
        authorizer: "user",
      },
      {
        integrationName: deleteUserFunctionName,
        path: usersBasePath,
        httpMethod: HttpMethod.DELETE,
        nodeJsFunction: deleteUserFunction.nodejsFunction,
        tableAccess: "readWrite",
        authorizer: "admin",
      },
    ];

    dynamoDbTable.grantAccessesToTable(httpApiGatewayRoutes);

    this.dynamoDbTable = dynamoDbTable.tableV2;
    this.httpApiGatewayRoutes = httpApiGatewayRoutes;
  }
}
