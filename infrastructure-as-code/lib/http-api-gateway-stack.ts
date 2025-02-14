import { Stack } from "aws-cdk-lib";
import {
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

interface HttpApiGatewayStackProps extends StackProps {
  name: string;
  allowedOrigins: string[];
  userTableName: string;
}

export class HttpApiGatewayStack extends Stack {
  readonly httpApiGateway: HttpApi;
  readonly adminHttpAuthorizer: HttpLambdaAuthorizer;

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
