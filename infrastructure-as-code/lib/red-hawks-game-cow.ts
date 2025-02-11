import { custom_resources, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { dataInit } from "../dynamo-db-seed-data/seed";
import { DynamoDb } from "../modules/dynamo-db";
import { Environment } from "../types/environments";
import { Region } from "../types/regions";
import * as path from "path";

interface Props extends StackProps {
  environment: Environment;
  region: Region;
  product: string;
  appName: string;
}

export class RedHawksGameCowStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);
    const baseProps = { ...props };

    const playersId = "players";
    const playersTable = new DynamoDb(this, `${playersId}-table`, {
      tableType: playersId,
      ...props,
    });

    // const gamesId = "games";
    // const gamesTable = new DynamoDb(this, `${gamesId}-table`, {
    //   tableType: gamesId,
    //   ...baseProps,
    // });

    // const votesId = "votes";
    // const votesTable = new DynamoDbTable(this, `${votesId}-table`, {
    //   name: votesId,
    //   hasStream: true,
    //   ...baseProps,
    //  });

    // const name = "votes-ws";
    // const wsSendFunctionName = `${name}-send`;
    // const wsSendFunction = new NodeJsFunctionLambda(
    //   this,
    //   `${wsSendFunctionName}-${awsResourceNames().function}`,
    //   {
    //     name: wsSendFunctionName,
    //     entryPath: path.join(__dirname, `../../web-sockets/src/votes/send.ts`),
    //     environmentVariables: { TABLE_NAME: table.table.tableName },
    //     ...baseProps,
    //   }
    // );

    // const usersId = "users";
    // const usersTable = new DynamoDb(this, `${usersId}-table`, {
    //   tableType: usersId,
    //   ...baseProps,
    // });

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
