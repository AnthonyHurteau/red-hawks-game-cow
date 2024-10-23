import {
  custom_resources,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  AttributeType,
  Billing,
  TableClass,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { dataInit } from "../dynamoDB-data/seed";

interface Props extends StackProps {
  appName: string;
}

export class RedHawksGameCowStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);
    const { appName } = props;
    const tableName = `${appName}-db`;

    const table = new TableV2(this, tableName, {
      tableName: tableName,
      partitionKey: { name: "pk", type: AttributeType.STRING },
      billing: Billing.onDemand(),
      removalPolicy: RemovalPolicy.RETAIN,
      deletionProtection: true,
      sortKey: { name: "id", type: AttributeType.STRING },
      pointInTimeRecovery: true,
      tableClass: TableClass.STANDARD,
      timeToLiveAttribute: "TimeToLive",
    });

    new custom_resources.AwsCustomResource(this, `${tableName}-seed-data`, {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [tableName]: dataInit,
          },
        },
        physicalResourceId: custom_resources.PhysicalResourceId.of(
          Date.now().toString()
        ),
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [table.tableArn],
      }),
    });
  }
}
