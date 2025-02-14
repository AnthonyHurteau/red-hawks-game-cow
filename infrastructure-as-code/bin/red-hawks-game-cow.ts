#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Environment } from "../types/environments";
import { Region } from "../types/regions";
import { WebSocketStack } from "../lib/web-socket-stack";
import { awsResourceNames, resourceName } from "../modules/common";
import { BaseProps } from "../types/base-props";
import { VotesStack } from "../lib/votes-stack";
import { GamesStack } from "../lib/games-stack";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { StartingPosition } from "aws-cdk-lib/aws-lambda";
import { FILE_EXTENSION, FUNCTION_ACTION } from "../constants/functions";
import { UsersStack } from "../lib/users-stack";
import { HttpApiGatewayStack } from "../lib/http-api-gateway-stack";
import { PlayersStack } from "../lib/players-stack";
import { AppStack } from "../lib/app-stack";

require("dotenv").config();

const appName = "Red Hawks Game Cow";

const app = new cdk.App();

const baseProps: BaseProps = {
  environment: process.env.ENVIRONMENT as Environment,
  region: process.env.REGION as Region,
  product: process.env.PRODUCT as string,
  appName,
};
const env = {
  account: process.env.AWS_ACCOUNT,
  region: process.env.AWS_REGION,
};

const appStackName = resourceName(baseProps, "app");
const appStack = new AppStack(
  app,
  `${appStackName}-${awsResourceNames().stack}`,
  {
    env,
    stackName: appStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${appStackName} IaC stack.`,
    name: appStackName,
    ...baseProps,
  }
);

const playersName = "players";
const playersStackName = resourceName(baseProps, playersName);
const playersStack = new PlayersStack(
  app,
  `${playersName}-${awsResourceNames().stack}`,
  {
    env,
    stackName: playersStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${playersStackName} IaC stack.`,
    name: playersName,
    functionDir: playersName,
    allowedOrigins: [process.env.ALLOWED_ORIGIN as string],
    ...baseProps,
  }
);

const gamesName = "games";
const gamesStackName = resourceName(baseProps, gamesName);
const gamesStack = new GamesStack(
  app,
  `${gamesName}-${awsResourceNames().stack}`,
  {
    env,
    stackName: gamesStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${gamesStackName} IaC stack.`,
    name: gamesName,
    functionDir: gamesName,
    allowedOrigins: [process.env.ALLOWED_ORIGIN as string],
    ...baseProps,
  }
);

const votesName = "votes";
const votesStackName = resourceName(baseProps, votesName);
const votesStack = new VotesStack(
  app,
  `${votesName}-${awsResourceNames().stack}`,
  {
    env,
    stackName: votesStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${votesStackName} IaC stack.`,
    name: votesName,
    functionDir: votesName,
    allowedOrigins: [process.env.ALLOWED_ORIGIN as string],
    ...baseProps,
  }
);

const usersName = "users";
const usersStackName = resourceName(baseProps, usersName);
const usersStack = new UsersStack(
  app,
  `${usersName}-${awsResourceNames().stack}`,
  {
    env,
    stackName: usersStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${usersStackName} IaC stack.`,
    name: usersName,
    functionDir: usersName,
    allowedOrigins: [process.env.ALLOWED_ORIGIN as string],
    ...baseProps,
  }
);

const httpApiGatewayName = "api-gateway";
const httpApiGatewayStackName = resourceName(baseProps, httpApiGatewayName);
const httpApiGatewayStack = new HttpApiGatewayStack(
  app,
  `${httpApiGatewayName}-${awsResourceNames().stack}`,
  {
    env,
    stackName: httpApiGatewayStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${httpApiGatewayStackName} IaC stack.`,
    name: httpApiGatewayName,
    allowedOrigins: [process.env.ALLOWED_ORIGIN as string],
    userTableName: usersStack.dynamoDbTable.tableName,
    ...baseProps,
  }
);

const httpApiGatewayRoutes = [
  playersStack.httpApiGatewayRoutes,
  gamesStack.httpApiGatewayRoutes,
  votesStack.httpApiGatewayRoutes,
  usersStack.httpApiGatewayRoutes,
].flat();
httpApiGatewayStack.setRoutes(httpApiGatewayRoutes);

const gamesWsName = "games-ws";
const gamesWsStackName = resourceName(baseProps, gamesWsName);
const gamesWebSocketStack = new WebSocketStack(
  app,
  `${gamesWsName}-${awsResourceNames().stack}`,
  {
    env,
    stackName: gamesWsStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${gamesWsStackName} IaC stack.`,
    name: gamesWsName,
    sendFunctionFile: `games/${FUNCTION_ACTION.send}.${FILE_EXTENSION}`,
    authAction: "user",
    userTableName: usersStack.dynamoDbTable.tableName,
    ...baseProps,
  }
);

gamesWebSocketStack.wsSendFunction.addEventSource(
  new DynamoEventSource(gamesStack.dynamoDbTable, {
    startingPosition: StartingPosition.LATEST,
  })
);

usersStack.dynamoDbTable.grantReadData(gamesWebSocketStack.wsAuthFunction);

const votesWsName = "votes-ws";
const votesWsStackName = resourceName(baseProps, votesWsName);
const votesWebScoketStack = new WebSocketStack(
  app,
  `${votesWsName}-${awsResourceNames().stack}`,
  {
    env,
    stackName: votesWsStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${votesWsStackName} IaC stack.`,
    name: votesWsName,
    sendFunctionFile: `votes/${FUNCTION_ACTION.send}.${FILE_EXTENSION}`,
    authAction: "admin",
    userTableName: usersStack.dynamoDbTable.tableName,
    ...baseProps,
  }
);

votesWebScoketStack.wsSendFunction.addEventSource(
  new DynamoEventSource(votesStack.dynamoDbTable, {
    startingPosition: StartingPosition.LATEST,
  })
);

usersStack.dynamoDbTable.grantReadData(votesWebScoketStack.wsAuthFunction);
