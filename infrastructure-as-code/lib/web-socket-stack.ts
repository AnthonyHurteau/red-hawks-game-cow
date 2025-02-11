import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { StackProps } from "../types/stack-props";
import * as path from "path";
import { NodeJsFunctionLambda } from "../modules/nodejs-function-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { WebSocketApiGateway } from "../modules/web-socket-api-gateway";
import { WebSocketApi } from "aws-cdk-lib/aws-apigatewayv2";
import { awsResourceNames } from "../modules/common";
import { DynamoDbTable } from "../modules/dynamo-db-table";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { FUNCTION_ACTION, WS_BASE_PATH } from "../constants/functions";

interface WebSocketStackProps extends StackProps {
  name: string;
  sendFunctionFile: string;
  authAction: "admin" | "user";
  userTableName: string;
}

export class WebSocketStack extends Stack {
  readonly table: TableV2;
  readonly wsDisconnectFunction: NodejsFunction;
  readonly wsConnectFunction: NodejsFunction;
  readonly wsSendFunction: NodejsFunction;
  readonly wsAuthFunction: NodejsFunction;
  readonly wsApiGateway: WebSocketApi;

  constructor(scope: Construct, id: string, props: WebSocketStackProps) {
    super(scope, id, props);
    const { name, sendFunctionFile, authAction, userTableName, ...baseProps } =
      props;

    const dynamoDbTable = new DynamoDbTable(
      this,
      `${name}-${awsResourceNames().table}`,
      {
        name,
        sortKeyEnabled: false,
        ...baseProps,
      }
    );

    const wsDisconnectFunctionName = `${name}-${FUNCTION_ACTION.disconnect}`;
    const wsDisconnectFunction = new NodeJsFunctionLambda(
      this,
      `${wsDisconnectFunctionName}-${awsResourceNames().function}`,
      {
        name: wsDisconnectFunctionName,
        entryPath: path.join(
          __dirname,
          `${WS_BASE_PATH}/handlers/${FUNCTION_ACTION.connect}.ts`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const wsConnectFunctionName = `${name}-${FUNCTION_ACTION.connect}`;
    const wsConnectFunction = new NodeJsFunctionLambda(
      this,
      `${wsConnectFunctionName}-${awsResourceNames().function}`,
      {
        name: wsConnectFunctionName,
        entryPath: path.join(
          __dirname,
          `${WS_BASE_PATH}/handlers/${FUNCTION_ACTION.connect}.ts`
        ),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const wsAuthFunctionName = `${name}-${authAction}`;
    const wsAuthFunction = new NodeJsFunctionLambda(
      this,
      `${wsAuthFunctionName}-${awsResourceNames().function}`,
      {
        name: wsAuthFunctionName,
        entryPath: path.join(
          __dirname,
          `${WS_BASE_PATH}/auth/${authAction}.ts`
        ),
        environmentVariables: { TABLE_NAME: userTableName },
        ...baseProps,
      }
    );

    const wsApiGateway = new WebSocketApiGateway(
      this,
      `${name}-${awsResourceNames().apigw}`,
      {
        name,
        authFunction: wsAuthFunction.nodejsFunction,
        connectHandler: wsConnectFunction.nodejsFunction,
        disconnectHandler: wsDisconnectFunction.nodejsFunction,
        ...baseProps,
      }
    );

    const wsSendFunctionName = `${name}-${FUNCTION_ACTION.send}`;
    const wsSendFunction = new NodeJsFunctionLambda(
      this,
      `${wsSendFunctionName}-${awsResourceNames().function}`,
      {
        name: wsSendFunctionName,
        entryPath: path.join(__dirname, `${WS_BASE_PATH}/${sendFunctionFile}`),
        environmentVariables: {
          TABLE_NAME: dynamoDbTable.tableV2.tableName,
          WS_ENDPOINT: wsApiGateway.webSocketApiStage.callbackUrl,
        },
        ...baseProps,
      }
    );

    const functions = [wsConnectFunction, wsDisconnectFunction, wsSendFunction];

    functions.forEach((fn) => {
      dynamoDbTable.tableV2.grantReadWriteData(fn.nodejsFunction);
    });

    wsApiGateway.webSocketApi.grantManageConnections(
      wsSendFunction.nodejsFunction
    );

    this.table = dynamoDbTable.tableV2;
    this.wsDisconnectFunction = wsDisconnectFunction.nodejsFunction;
    this.wsConnectFunction = wsConnectFunction.nodejsFunction;
    this.wsSendFunction = wsSendFunction.nodejsFunction;
    this.wsAuthFunction = wsAuthFunction.nodejsFunction;
    this.wsApiGateway = wsApiGateway.webSocketApi;
  }
}
