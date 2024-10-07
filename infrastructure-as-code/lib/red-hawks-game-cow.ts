import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  AttributeType,
  Billing,
  TableClass,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

interface Props extends StackProps {
  tableName: string;
}

export class RedHawksGameCowStack extends Stack {
  readonly table: TableV2;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const partitionKey = "PartitionKey";

    this.table = new TableV2(this, props.tableName, {
      tableName: props.tableName,
      partitionKey: { name: partitionKey, type: AttributeType.STRING },
      billing: Billing.onDemand(),
      removalPolicy: RemovalPolicy.RETAIN,
      deletionProtection: true,
      sortKey: { name: "Id", type: AttributeType.STRING },
      pointInTimeRecovery: true,
      tableClass: TableClass.STANDARD,
      timeToLiveAttribute: "TimeToLive",
    });
  }
}
