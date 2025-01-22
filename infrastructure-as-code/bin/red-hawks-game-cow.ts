#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { RedHawksGameCowStack } from "../lib/red-hawks-game-cow";
import { Environment } from "../types/environments";
import { Region } from "../types/regions";

require("dotenv").config();

const appName = "RedHawksGameCow";
const stackName = `${process.env.PRODUCT}-${process.env.REGION}-${process.env.ENVIRONMENT}`;

const app = new cdk.App();
new RedHawksGameCowStack(app, `${process.env.PRODUCT}-stack`, {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
  stackName,
  description: `The ${appName} ${process.env.ENVIRONMENT} IaC stack.`,
  appName,
  environment: process.env.ENVIRONMENT as Environment,
  region: process.env.REGION as Region,
  product: process.env.PRODUCT as string,
});
