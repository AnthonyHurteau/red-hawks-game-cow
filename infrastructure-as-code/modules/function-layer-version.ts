import { Construct } from "constructs";
import { BaseProps } from "../types/base-props";
import { RemovalPolicy } from "aws-cdk-lib";
import { resourceName } from "./common";
import {
  Architecture,
  Code,
  LayerVersion,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import * as path from "path";

interface FunctionLayerVersionProps extends BaseProps {
  name: string;
}

export class FunctionLayerVersion extends Construct {
  readonly layer: LayerVersion;

  constructor(scope: Construct, id: string, props: FunctionLayerVersionProps) {
    super(scope, id);
    const { name, ...baseProps } = props;

    const layerName = resourceName(baseProps, name);

    const layer = new LayerVersion(this, layerName, {
      layerVersionName: layerName,
      removalPolicy: RemovalPolicy.RETAIN,
      code: Code.fromAsset(path.join(__dirname, "lambda-handler")),
      compatibleArchitectures: [Architecture.ARM_64],
      compatibleRuntimes: [Runtime.NODEJS_20_X],
    });

    this.layer = layer;
  }
}
