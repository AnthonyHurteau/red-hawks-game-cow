import { Construct } from "constructs";
import { BaseProps } from "../types/base-props";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Architecture, ILayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";
import { resourceName } from "./common";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

type FunctionMemorySize = 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192;

interface NodeJsFunctionLambdaProps extends BaseProps {
  name: string;
  memorySize?: FunctionMemorySize;
  entryPath: string;
  timeout?: number;
  environmentVariables?: Record<string, string>;
  layers?: ILayerVersion[];
}

const LAMBDA_HANDLER = "lambdaHandler";

export class NodeJsFunctionLambda extends Construct {
  readonly nodejsFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: NodeJsFunctionLambdaProps) {
    super(scope, id);
    const {
      name,
      memorySize = 2048,
      entryPath,
      environmentVariables,
      timeout = 10,
      layers,
      ...baseProps
    } = props;

    const functionName = resourceName(baseProps, name);

    const nodeJsFunction = new NodejsFunction(this, functionName, {
      functionName: functionName,
      description: `${baseProps.appName} - ${baseProps.environment} - ${name} Node.js Lambda Function`,
      runtime: Runtime.NODEJS_20_X,
      memorySize: memorySize,
      timeout: Duration.seconds(timeout),
      architecture: Architecture.ARM_64,
      layers: layers,
      handler: LAMBDA_HANDLER,
      entry: entryPath,
      logRetention: RetentionDays.ONE_WEEK,
      environment: environmentVariables,
    });

    this.nodejsFunction = nodeJsFunction;
  }
}
