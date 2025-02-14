import { Construct } from "constructs";
import { BaseProps } from "../types/base-props";
import {
  CorsHttpMethod,
  HttpApi,
  HttpStage,
} from "aws-cdk-lib/aws-apigatewayv2";
import { resourceName } from "./common";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  HttpLambdaAuthorizer,
  HttpLambdaResponseType,
} from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { Duration } from "aws-cdk-lib";

interface HttpApiGatewayProps extends BaseProps {
  name: string;
  allowedOrigins: string[];
  allowedMethods: CorsHttpMethod[];
  adminAuthFunction: NodejsFunction;
  userAuthFunction: NodejsFunction;
}

export class HttpApiGateway extends Construct {
  readonly httpApiGateway: HttpApi;
  readonly adminHttpAuthorizer: HttpLambdaAuthorizer;

  constructor(scope: Construct, id: string, props: HttpApiGatewayProps) {
    super(scope, id);
    const {
      name,
      allowedMethods,
      allowedOrigins,
      adminAuthFunction,
      userAuthFunction,
      ...baseProps
    } = props;

    const userHttpAuthorizerName = resourceName(baseProps, `${name}-user-auth`);
    const userHttpAuthorizer = new HttpLambdaAuthorizer(
      userHttpAuthorizerName,
      userAuthFunction,
      {
        responseTypes: [HttpLambdaResponseType.IAM],
        identitySource: ["$request.header.Authorization"],
        resultsCacheTtl: Duration.minutes(15),
      }
    );

    const adminHttpAuthorizerName = resourceName(
      baseProps,
      `${name}-admin-auth`
    );
    const adminHttpAuthorizer = new HttpLambdaAuthorizer(
      adminHttpAuthorizerName,
      adminAuthFunction,
      {
        responseTypes: [HttpLambdaResponseType.IAM],
        identitySource: ["$request.header.Authorization"],
        resultsCacheTtl: Duration.minutes(15),
      }
    );

    const httpApiGatewayName = resourceName(baseProps, name);
    const httpApiGateway = new HttpApi(this, httpApiGatewayName, {
      apiName: httpApiGatewayName,
      description: `${baseProps.appName} - ${baseProps.environment} - ${name} HTTP API Gateway`,
      defaultAuthorizer: userHttpAuthorizer,
      corsPreflight: {
        allowCredentials: false,
        allowHeaders: ["content-type", "Authorization"],
        allowMethods: allowedMethods,
        allowOrigins: allowedOrigins,
      },
    });

    this.httpApiGateway = httpApiGateway;
    this.adminHttpAuthorizer = adminHttpAuthorizer;
  }
}
