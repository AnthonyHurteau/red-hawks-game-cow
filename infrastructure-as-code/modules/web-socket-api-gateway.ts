import { Construct } from "constructs";
import { BaseProps } from "../types/base-props";
import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { resourceName } from "./common";
import { WebSocketLambdaAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";

interface WebSocketAPiProps extends BaseProps {
  name: string;
  authFunction: NodejsFunction;
  connectHandler: NodejsFunction;
  disconnectHandler: NodejsFunction;
}

export class WebSocketApiGateway extends Construct {
  readonly webSocketApi: WebSocketApi;
  readonly webSocketApiStage: WebSocketStage;

  constructor(scope: Construct, id: string, props: WebSocketAPiProps) {
    super(scope, id);
    const {
      name,
      authFunction,
      connectHandler,
      disconnectHandler,
      ...baseProps
    } = props;

    const webSocketApiAuthName = resourceName(baseProps, `${name}-auth`);
    const webSockeAuthorizer = new WebSocketLambdaAuthorizer(
      webSocketApiAuthName,
      authFunction,
      {
        identitySource: ["route.request.querystring.userId"],
      }
    );

    const webSocketApiName = resourceName(baseProps, name);
    const webSocketApi = new WebSocketApi(this, webSocketApiName, {
      apiName: webSocketApiName,
      description: `${baseProps.appName} - ${baseProps.environment} - ${name} WebSocket API Gateway`,
      connectRouteOptions: {
        authorizer: webSockeAuthorizer,
        integration: new WebSocketLambdaIntegration(
          "ConnectIntegration",
          connectHandler
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "DisconnectIntegration",
          disconnectHandler
        ),
      },
    });

    const webSocketApiStageName = resourceName(baseProps, `${name}-stage`);
    const webSocketStage = new WebSocketStage(this, webSocketApiStageName, {
      webSocketApi,
      stageName: baseProps.environment,
      description: `${baseProps.environment} ${name} stage`,
      autoDeploy: true,
    });

    this.webSocketApiStage = webSocketStage;
    this.webSocketApi = webSocketApi;
  }
}
