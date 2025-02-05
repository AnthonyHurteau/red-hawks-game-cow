import { Construct } from "constructs";
import { BaseProps } from "../types/base-props";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { resourceName } from "./common";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { TableAccess } from "./dynamo-db-table";

export interface HttpApiGatewayRoute {
  integrationName: string;
  path: string;
  httpMethod: HttpMethod;
  nodeJsFunction: NodejsFunction;
  tableAccess: TableAccess;
}

interface HttpApiGatewayProps extends BaseProps {
  name: string;
  allowedOrigins: string[];
  allowedMethods: CorsHttpMethod[];
  httpApiGatewayRoutes: HttpApiGatewayRoute[];
}

export class HttpApiGateway extends Construct {
  readonly httpApiGateway: HttpApi;

  constructor(scope: Construct, id: string, props: HttpApiGatewayProps) {
    super(scope, id);
    const {
      name,
      allowedMethods,
      allowedOrigins,
      httpApiGatewayRoutes,
      ...baseProps
    } = props;

    const httpApiGatewayName = resourceName(baseProps, name);

    const httpApiGateway = new HttpApi(this, httpApiGatewayName, {
      apiName: httpApiGatewayName,
      description: `${baseProps.appName} - ${baseProps.environment} - ${name} HTTP API Gateway`,
      corsPreflight: {
        allowCredentials: false,
        allowHeaders: ["content-type", "Authorization"],
        allowMethods: allowedMethods,
        allowOrigins: allowedOrigins,
      },
    });

    httpApiGatewayRoutes.forEach((route) => {
      const httpLambdaIntegration = new HttpLambdaIntegration(
        `${route.integrationName}Integration`,
        route.nodeJsFunction
      );
      httpApiGateway.addRoutes({
        path: route.path,
        methods: [route.httpMethod],
        integration: httpLambdaIntegration,
      });
    });

    this.httpApiGateway = httpApiGateway;
  }
}
