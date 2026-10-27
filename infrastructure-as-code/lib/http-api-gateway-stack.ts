import { CfnOutput, Stack } from "aws-cdk-lib";
import {
  CfnRoute,
  CfnStage,
  CorsHttpMethod,
  HttpApi,
  HttpNoneAuthorizer,
} from "aws-cdk-lib/aws-apigatewayv2";
import { Construct } from "constructs";
import { StackProps } from "../types/stack-props";
import { HttpApiGateway } from "../modules/http-api-gateway";
import { awsResourceNames } from "../modules/common";
import { NodeJsFunctionLambda } from "../modules/nodejs-function-lambda";
import * as path from "path";
import { API_BASE_PATH, FUNCTION_ACTION } from "../constants/functions";
import {
  Authorizer,
  HttpApiGatewayRoute,
} from "../types/http-api-gateway-route";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { HttpLambdaAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { grantSecrets } from "../modules/secrets";

interface HttpApiGatewayStackProps extends StackProps {
  name: string;
  allowedOrigins: string[];
  userTableName: string;
}

export class HttpApiGatewayStack extends Stack {
  readonly httpApiGateway: HttpApi;
  readonly adminHttpAuthorizer: HttpLambdaAuthorizer;
  readonly adminAuthFunction: NodejsFunction;
  readonly userAuthFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: HttpApiGatewayStackProps) {
    super(scope, id, props);
    const { name, allowedOrigins, userTableName, ...baseProps } = props;

    const userAuthFunctionName = `${name}-${FUNCTION_ACTION.user}`;
    const userAuthFunction = new NodeJsFunctionLambda(
      this,
      `${userAuthFunctionName}-${awsResourceNames().function}`,
      {
        name: userAuthFunctionName,
        entryPath: path.join(
          __dirname,
          `${API_BASE_PATH}/auth/${FUNCTION_ACTION.user}.ts`
        ),
        environmentVariables: { TABLE_NAME: userTableName },
        ...baseProps,
      }
    );

    const adminAuthFunctionName = `${name}-${FUNCTION_ACTION.admin}`;
    const adminAuthFunction = new NodeJsFunctionLambda(
      this,
      `${adminAuthFunctionName}-${awsResourceNames().function}`,
      {
        name: adminAuthFunctionName,
        entryPath: path.join(
          __dirname,
          `${API_BASE_PATH}/auth/${FUNCTION_ACTION.admin}.ts`
        ),
        environmentVariables: { TABLE_NAME: userTableName },
        ...baseProps,
      }
    );

    grantSecrets(userAuthFunction.nodejsFunction, baseProps, ["token-secret"]);
    grantSecrets(adminAuthFunction.nodejsFunction, baseProps, ["token-secret"]);

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
        adminAuthFunction: adminAuthFunction.nodejsFunction,
        userAuthFunction: userAuthFunction.nodejsFunction,
        ...baseProps,
      }
    );

    this.httpApiGateway = httpApiGateway.httpApiGateway;
    this.adminHttpAuthorizer = httpApiGateway.adminHttpAuthorizer;
    this.adminAuthFunction = adminAuthFunction.nodejsFunction;
    this.userAuthFunction = userAuthFunction.nodejsFunction;

    new CfnOutput(this, "httpApiUrl", {
      value: httpApiGateway.httpApiGateway.url!,
    });
  }

  setRoutes(httpApiGatewayRoutes: HttpApiGatewayRoute[]) {
    httpApiGatewayRoutes.forEach((route) => {
      const httpLambdaIntegration = new HttpLambdaIntegration(
        `${route.integrationName}Integration`,
        route.nodeJsFunction
      );
      this.httpApiGateway.addRoutes({
        path: route.path,
        methods: [route.httpMethod],
        integration: httpLambdaIntegration,
        authorizer: this.getAuthorizer(route.authorizer),
      });
    });
    this.setThrottling();
  }

  // Throttling is set on the default stage. Limits are shared by all callers,
  // so they cap cost from floods rather than block a single client.
  private setThrottling() {
    const stage = this.httpApiGateway.defaultStage!.node
      .defaultChild as CfnStage;
    stage.defaultRouteSettings = {
      throttlingRateLimit: 50,
      throttlingBurstLimit: 100,
    };
    // RouteSettings is raw JSON, so keys use CloudFormation casing.
    // Tighter limits on routes that create users or check the admin password.
    stage.routeSettings = {
      "POST /users": { ThrottlingRateLimit: 5, ThrottlingBurstLimit: 10 },
      "POST /users/admin": { ThrottlingRateLimit: 1, ThrottlingBurstLimit: 3 },
    };
    // Route settings refer to routes by key, so the routes must exist first.
    this.httpApiGateway.node
      .findAll()
      .filter((c) => c instanceof CfnRoute)
      .forEach((route) => stage.addDependency(route as CfnRoute));
  }

  private getAuthorizer(authorizer: Authorizer) {
    if (authorizer === "admin") {
      return this.adminHttpAuthorizer;
    } else if (authorizer === "none") {
      return new HttpNoneAuthorizer();
    } else if (authorizer === "user") {
      return undefined;
    }
    return undefined;
  }
}
