import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { StackProps } from "../types/stack-props";
import * as path from "path";
import { NodeJsFunctionLambda } from "../modules/nodejs-function-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { WebSocketApiGateway } from "../modules/web-socket-api-gateway";
import { WebSocketApi } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { awsResourceNames } from "../modules/common";
import { DynamoDbTable } from "../modules/dynamo-db-table";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";

interface WebSocketStackProps extends StackProps {
  domainName: string;
  sendFunctionFile: string;
}

export class WebSocketStack extends Stack {
  readonly table: TableV2;
  readonly wsDisconnectFunction: NodejsFunction;
  readonly wsConnectFunction: NodejsFunction;
  readonly wsSendFunction: NodejsFunction;
  readonly wsApiGateway: WebSocketApi;

  constructor(scope: Construct, id: string, props: WebSocketStackProps) {
    super(scope, id, props);
    const { domainName, sendFunctionFile, ...baseProps } = props;

    const table = new DynamoDbTable(
      this,
      `${domainName}-${awsResourceNames().table}`,
      {
        name: domainName,
        hasSortKey: false,
        ...baseProps,
      }
    );

    const wsDisconnectFunctionName = `${domainName}-disconnect`;
    const wsDisconnectFunction = new NodeJsFunctionLambda(
      this,
      `${wsDisconnectFunctionName}-${awsResourceNames().function}`,
      {
        name: wsDisconnectFunctionName,
        entryPath: path.join(
          __dirname,
          "../../web-sockets/src/handlers/disconnect.ts"
        ),
        environmentVariables: { TABLE_NAME: table.table.tableName },
        ...baseProps,
      }
    );

    const wsConnectFunctionName = `${domainName}-connect`;
    const wsConnectFunction = new NodeJsFunctionLambda(
      this,
      `${wsConnectFunctionName}-${awsResourceNames().function}`,
      {
        name: wsConnectFunctionName,
        entryPath: path.join(
          __dirname,
          "../../web-sockets/src/handlers/connect.ts"
        ),
        environmentVariables: { TABLE_NAME: table.table.tableName },
        ...baseProps,
      }
    );

    const wsSendFunctionName = `${domainName}-send`;
    const wsSendFunction = new NodeJsFunctionLambda(
      this,
      `${wsSendFunctionName}-${awsResourceNames().function}`,
      {
        name: wsConnectFunctionName,
        entryPath: path.join(
          __dirname,
          `../../web-sockets/src/${sendFunctionFile}`
        ),
        environmentVariables: { TABLE_NAME: table.table.tableName },
        ...baseProps,
      }
    );

    const wsApiGateway = new WebSocketApiGateway(
      this,
      `${domainName}-${awsResourceNames().apigw}`,
      {
        name: domainName,
        connectHandler: wsConnectFunction.nodejsFunction,
        disconnectHandler: wsDisconnectFunction.nodejsFunction,
        ...baseProps,
      }
    );

    wsApiGateway.webSocketAPi.addRoute("send", {
      integration: new WebSocketLambdaIntegration(
        "SendIntegration",
        wsSendFunction.nodejsFunction
      ),
    });

    this.table = table.table;
    this.wsDisconnectFunction = wsDisconnectFunction.nodejsFunction;
    this.wsConnectFunction = wsConnectFunction.nodejsFunction;
    this.wsSendFunction = wsSendFunction.nodejsFunction;
    this.wsApiGateway = wsApiGateway.webSocketAPi;
  }
}
