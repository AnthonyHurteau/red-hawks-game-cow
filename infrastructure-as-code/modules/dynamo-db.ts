import { Construct } from "constructs";
import { BaseProps } from "../types/base-props";
import {
  AttributeType,
  Billing,
  TableClass,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

interface DynamoDbProps extends BaseProps {
  tableType: string;
  partitionKeyName?: string;
  sortKeyName?: string;
  hasSortKey?: boolean;
}

export class DynamoDb extends Construct {
  readonly table: TableV2;

  constructor(scope: Construct, id: string, props: DynamoDbProps) {
    super(scope, id);
    const {
      tableType,
      partitionKeyName = "pk",
      sortKeyName = "sk",
      environment,
      region,
      product,
      hasSortKey = true,
    } = props;
    const tableName = `${product}-${tableType}-${region}-${environment}`;

    const table = new TableV2(this, tableName, {
      tableName: tableName,
      partitionKey: { name: partitionKeyName, type: AttributeType.STRING },
      billing: Billing.onDemand(),
      removalPolicy: RemovalPolicy.RETAIN,
      deletionProtection: true,
      sortKey: hasSortKey
        ? { name: sortKeyName, type: AttributeType.STRING }
        : undefined,
      pointInTimeRecovery: true,
      tableClass: TableClass.STANDARD,
      timeToLiveAttribute: "timeToLive",
    });

    this.table = table;
  }
}
