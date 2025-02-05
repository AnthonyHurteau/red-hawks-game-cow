import { Construct } from "constructs";
import { BaseProps } from "../types/base-props";
import {
  AttributeType,
  Billing,
  StreamViewType,
  TableClass,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";
import { resourceName } from "./common";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export type TableAccess = "read" | "write" | "readWrite";

interface DynamoDbTableProps extends BaseProps {
  name: string;
  partitionKeyName?: string;
  sortKeyName?: string;
  sortKeyEnabled?: boolean;
  streamEnabled?: boolean;
}

export class DynamoDbTable extends Construct {
  readonly tableV2: TableV2;

  constructor(scope: Construct, id: string, props: DynamoDbTableProps) {
    super(scope, id);
    const {
      name,
      partitionKeyName = "pk",
      sortKeyName = "sk",
      sortKeyEnabled = true,
      streamEnabled = false,
      ...baseProps
    } = props;

    const tableName = resourceName(baseProps, name);

    const table = new TableV2(this, tableName, {
      tableName: tableName,
      partitionKey: { name: partitionKeyName, type: AttributeType.STRING },
      billing: Billing.onDemand(),
      removalPolicy: RemovalPolicy.RETAIN,
      deletionProtection: false,
      sortKey: sortKeyEnabled
        ? { name: sortKeyName, type: AttributeType.STRING }
        : undefined,
      pointInTimeRecovery: false,
      tableClass: TableClass.STANDARD,
      timeToLiveAttribute: "timeToLive",
      dynamoStream: streamEnabled ? StreamViewType.NEW_IMAGE : undefined,
    });

    this.tableV2 = table;
  }

  grantAccessesToTable(
    lambdaFunctions: {
      nodeJsFunction: NodejsFunction;
      tableAccess: TableAccess;
    }[]
  ) {
    lambdaFunctions.forEach((lambdaFunction) => {
      switch (lambdaFunction.tableAccess) {
        case "read":
          this.tableV2.grantReadData(lambdaFunction.nodeJsFunction);
          break;
        case "write":
          this.tableV2.grantWriteData(lambdaFunction.nodeJsFunction);
          break;
        case "readWrite":
          this.tableV2.grantReadWriteData(lambdaFunction.nodeJsFunction);
          break;
        default:
          throw new Error(
            `Unsupported access level: ${lambdaFunction.tableAccess}`
          );
      }
    });
  }
}
