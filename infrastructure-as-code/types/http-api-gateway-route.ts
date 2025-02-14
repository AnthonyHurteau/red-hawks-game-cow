import { HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { TableAccess } from "../modules/dynamo-db-table";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export type Authorizer = "admin" | "user" | "none";

export interface HttpApiGatewayRoute {
  integrationName: string;
  path: string;
  httpMethod: HttpMethod;
  nodeJsFunction: NodejsFunction;
  tableAccess: TableAccess;
  authorizer: Authorizer;
}
