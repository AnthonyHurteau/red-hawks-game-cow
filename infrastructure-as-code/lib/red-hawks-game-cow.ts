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
import { dataInit } from "../dynamo-db-seed-data/seed";
import { DynamoDb } from "../modules/dynamo-db";
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

    const gamesId = "games";
    const gamesTable = new DynamoDb(this, `${gamesId}-table`, {
      tableType: gamesId,
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

    const usersId = "users";
    const usersTable = new DynamoDb(this, `${usersId}-table`, {
      tableType: usersId,
      environment,
      region,
      appName,
      product,
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
