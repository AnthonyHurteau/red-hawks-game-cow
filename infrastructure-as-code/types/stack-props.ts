import { StackProps as AwsStackProps } from "aws-cdk-lib";
import { BaseProps } from "./base-props";

export interface StackProps extends BaseProps, AwsStackProps {}
