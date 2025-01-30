#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { RedHawksGameCowStack } from "../lib/red-hawks-game-cow";
import { Environment } from "../types/environments";
import { Region } from "../types/regions";
import { WebSocketStack } from "../lib/web-socket-stack";
import { awsResourceNames, resourceName } from "../modules/common";
import { BaseProps } from "../types/base-props";

require("dotenv").config();

const appName = "Red Hawks Game Cow";

const app = new cdk.App();

const baseProps: BaseProps = {
  environment: process.env.ENVIRONMENT as Environment,
  region: process.env.REGION as Region,
  product: process.env.PRODUCT as string,
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

const gamesWsDomainName = "games-ws";
const gamesWsStackName = resourceName(baseProps, gamesWsDomainName);
new WebSocketStack(app, `${gamesWsDomainName}-${awsResourceNames().stack}`, {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
  stackName: gamesWsStackName,
  description: `The ${appName} ${process.env.ENVIRONMENT} IaC stack.`,
  domainName: gamesWsDomainName,
  sendFunctionFile: "votes/send.ts",
  ...baseProps,
});

const votesWsDomainName = "votes-ws";
const votesWsStackName = resourceName(baseProps, votesWsDomainName);
new WebSocketStack(app, `${votesWsDomainName}-${awsResourceNames().stack}`, {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
  stackName: votesWsStackName,
  description: `The ${appName} ${process.env.ENVIRONMENT} IaC stack.`,
  domainName: votesWsDomainName,
  sendFunctionFile: "votes/send.ts",
  ...baseProps,
});
