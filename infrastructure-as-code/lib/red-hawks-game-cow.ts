import {
  custom_resources,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  AttributeType,
  Billing,
  ProjectionType,
  TableClass,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { dataInit } from "../dynamoDB-data/seed";
import { DynamoDb } from "../modules/dynamoDb";
import { Environment } from "../types/environments";
import { Region } from "../types/regions";

interface Props extends StackProps {
  appName: string;
  environment: Environment;
  region: Region;
  product: string;
}

export class RedHawksGameCowStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);
    const { appName, environment, region, product } = props;

    const playersId = "players";
    const playersTable = new DynamoDb(this, `${playersId}-table`, {
      tableType: playersId,
      environment,
      region,
      appName,
      product,
    });

    const votesId = "votes";
    const votesTable = new DynamoDb(this, `${votesId}-table`, {
      tableType: votesId,
      environment,
      region,
      appName,
      product,
    });

    const tableName = `${appName}`;
    const partitionKey = "pk";
    const table = new TableV2(this, tableName, {
      tableName: tableName,
      partitionKey: { name: partitionKey, type: AttributeType.STRING },
      billing: Billing.onDemand(),
      removalPolicy: RemovalPolicy.RETAIN,
      deletionProtection: true,
      sortKey: { name: "id", type: AttributeType.STRING },
      pointInTimeRecovery: true,
      tableClass: TableClass.STANDARD,
      timeToLiveAttribute: "timeToLive",
    });

    const userId = "userId";
    table.addLocalSecondaryIndex({
      indexName: `${partitionKey}-${userId}-index`,
      sortKey: { name: userId, type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    new custom_resources.AwsCustomResource(this, `${playersId}-seed-data`, {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [playersTable.table.tableName]: dataInit,
          },
        },
        physicalResourceId: custom_resources.PhysicalResourceId.of(
          Date.now().toString()
        ),
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [playersTable.table.tableArn],
      }),
    });
  }
}
