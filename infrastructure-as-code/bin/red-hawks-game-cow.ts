#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { RedHawksGameCowStack } from "../lib/red-hawks-game-cow";

require("dotenv").config();

const appName = "RedHawksGameCow";
const stackName = `stack-${process.env.AWS_REGION}-${appName}`;

const app = new cdk.App();
new RedHawksGameCowStack(app, "RedHawksGameCowStack", {
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
  stackName,
  description: `The ${appName} IaC stack.`,
  appName,
});
