#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { RedHawksGameCowStack } from "../lib/red-hawks-game-cow";
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

const stackName1 = `${process.env.PRODUCT}-${process.env.REGION}-${process.env.ENVIRONMENT}`;
new RedHawksGameCowStack(
  app,
  `${process.env.PRODUCT}-${awsResourceNames().stack}`,
  {
    env,
    stackName: stackName1,
    description: `The ${appName} ${process.env.ENVIRONMENT} IaC stack.`,
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
