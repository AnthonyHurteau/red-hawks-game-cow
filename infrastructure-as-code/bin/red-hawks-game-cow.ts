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

require("dotenv").config();

const appName = "Red Hawks Game Cow";

const app = new cdk.App();

const baseProps: BaseProps = {
  environment: process.env.ENVIRONMENT as Environment,
  region: process.env.REGION as Region,
  product: process.env.PRODUCT as string,
  appName,
};

const stackName1 = `${process.env.PRODUCT}-${process.env.REGION}-${process.env.ENVIRONMENT}`;
new RedHawksGameCowStack(
  app,
  `${process.env.PRODUCT}-${awsResourceNames().stack}`,
  {
    env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
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
    env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
    stackName: gamesStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${gamesStackName} IaC stack.`,
    name: gamesName,
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
    env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
    stackName: votesStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${votesStackName} IaC stack.`,
    name: votesName,
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
    env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
    stackName: gamesWsStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${gamesWsStackName} IaC stack.`,
    name: gamesWsName,
    sendFunctionFile: "votes/send.ts",
    streamTable: gamesStack.dynamoDbTable,
    ...baseProps,
  }
);

const votesWsName = "votes-ws";
const votesWsStackName = resourceName(baseProps, votesWsName);
const votesWebScoketStack = new WebSocketStack(
  app,
  `${votesWsName}-${awsResourceNames().stack}`,
  {
    env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
    stackName: votesWsStackName,
    description: `The ${appName} ${process.env.ENVIRONMENT} ${votesWsStackName} IaC stack.`,
    name: votesWsName,
    sendFunctionFile: "votes/send.ts",
    streamTable: votesStack.dynamoDbTable,
    ...baseProps,
  }
);
