import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { NodeJsFunctionLambda } from "../modules/nodejs-function-lambda";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { awsResourceNames } from "../modules/common";
import { DynamoDbTable } from "../modules/dynamo-db-table";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import {
  HttpApiGateway,
  HttpApiGatewayRoute,
} from "../modules/http-api-gateway";
import { ServiceStackProps } from "../types/service-stack-props";

export class VotesStack extends Stack {
  readonly dynamoDbTable: TableV2;
  readonly httpApiGateway: HttpApi;

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);
    const { name, allowedOrigins, ...baseProps } = props;

    const dynamoDbTable = new DynamoDbTable(
      this,
      `${name}-${awsResourceNames().table}`,
      {
        name,
        streamEnabled: true,
        ...baseProps,
      }
    );

    const getVoteFunctionName = `getVote`;
    const getVoteFunction = new NodeJsFunctionLambda(
      this,
      `${getVoteFunctionName}-${awsResourceNames().function}`,
      {
        name: getVoteFunctionName,
        entryPath: path.join(__dirname, "../../api/src/votes/get.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const getVotesFunctionName = `getVotes`;
    const getVotesFunction = new NodeJsFunctionLambda(
      this,
      `${getVotesFunctionName}-${awsResourceNames().function}`,
      {
        name: getVotesFunctionName,
        entryPath: path.join(__dirname, "../../api/src/votes/getList.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const createVoteFunctionName = `createVote`;
    const createVoteFunction = new NodeJsFunctionLambda(
      this,
      `${createVoteFunctionName}-${awsResourceNames().function}`,
      {
        name: createVoteFunctionName,
        entryPath: path.join(__dirname, "../../api/src/votes/create.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const updateVoteFunctionName = `updateVote`;
    const updateVoteFunction = new NodeJsFunctionLambda(
      this,
      `${updateVoteFunctionName}-${awsResourceNames().function}`,
      {
        name: updateVoteFunctionName,
        entryPath: path.join(__dirname, "../../api/src/votes/update.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const deleteVoteFunctionName = `deleteVote`;
    const deleteVoteFunction = new NodeJsFunctionLambda(
      this,
      `${deleteVoteFunctionName}-${awsResourceNames().function}`,
      {
        name: deleteVoteFunctionName,
        entryPath: path.join(__dirname, "../../api/src/votes/delete.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const deleteAllVotesFunctionName = `deleteAllVotes`;
    const deleteAllVotesFunction = new NodeJsFunctionLambda(
      this,
      `${deleteAllVotesFunctionName}-${awsResourceNames().function}`,
      {
        name: deleteAllVotesFunctionName,
        entryPath: path.join(__dirname, "../../api/src/votes/deleteAll.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const mockVotesFunctionName = `mockVotes`;
    const mockVotesFunction = new NodeJsFunctionLambda(
      this,
      `${mockVotesFunctionName}-${awsResourceNames().function}`,
      {
        name: mockVotesFunctionName,
        entryPath: path.join(__dirname, "../../api/src/votes/mock.ts"),
        environmentVariables: { TABLE_NAME: dynamoDbTable.tableV2.tableName },
        ...baseProps,
      }
    );

    const votesBasePath = "/votes";
    const httpApiGatewayRoutes: HttpApiGatewayRoute[] = [
      {
        integrationName: getVoteFunctionName,
        path: `${votesBasePath}/{userId}`,
        httpMethod: HttpMethod.GET,
        nodeJsFunction: getVoteFunction.nodejsFunction,
        tableAccess: "read",
      },
      {
        integrationName: getVotesFunctionName,
        path: votesBasePath,
        httpMethod: HttpMethod.GET,
        nodeJsFunction: getVotesFunction.nodejsFunction,
        tableAccess: "read",
      },
      {
        integrationName: createVoteFunctionName,
        path: votesBasePath,
        httpMethod: HttpMethod.POST,
        nodeJsFunction: createVoteFunction.nodejsFunction,
        tableAccess: "write",
      },
      {
        integrationName: updateVoteFunctionName,
        path: votesBasePath,
        httpMethod: HttpMethod.PUT,
        nodeJsFunction: updateVoteFunction.nodejsFunction,
        tableAccess: "readWrite",
      },
      {
        integrationName: deleteVoteFunctionName,
        path: `${votesBasePath}/{userId}`,
        httpMethod: HttpMethod.DELETE,
        nodeJsFunction: deleteVoteFunction.nodejsFunction,
        tableAccess: "readWrite",
      },
      {
        integrationName: deleteAllVotesFunctionName,
        path: `${votesBasePath}/all`,
        httpMethod: HttpMethod.DELETE,
        nodeJsFunction: deleteAllVotesFunction.nodejsFunction,
        tableAccess: "readWrite",
      },
    ];

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
        httpApiGatewayRoutes,
        ...baseProps,
      }
    );

    dynamoDbTable.grantAccessesToTable(httpApiGatewayRoutes);

    this.dynamoDbTable = dynamoDbTable.tableV2;
    this.httpApiGateway = httpApiGateway.httpApiGateway;
  }
}
