import { Construct } from "constructs";
import { BaseProps } from "../types/base-props";
import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

interface WebSocketAPiProps extends BaseProps {}

export class WebSocketApiGateway extends Construct {
  readonly webSocketAPi: WebSocketApi;

  constructor(scope: Construct, id: string, props: WebSocketAPiProps) {
    super(scope, id);
    const { environment, region, product } = props;

    const webSocketApiName = `${product}-${tableType}-${region}-${environment}`;
    const webSocketApi = new WebSocketApi(this, webSocketApiName, {
      connectRouteOptions: {
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
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "DefaultIntegration",
          defaultHandler
        ),
      },
    });

    const webSocketApiStageName = `${product}-stage-${region}-${environment}`;
    new WebSocketStage(this, webSocketApiStageName, {
      webSocketApi,
      stageName: environment,
      description: `${environment} web socket stage`,
      autoDeploy: true,
    });

    this.webSocketAPi = webSocketApi;
  }
}
