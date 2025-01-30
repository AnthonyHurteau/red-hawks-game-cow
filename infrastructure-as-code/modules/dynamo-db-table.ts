import { Construct } from "constructs";
import { BaseProps } from "../types/base-props";
import {
  AttributeType,
  Billing,
  TableClass,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";
import { resourceName } from "./common";

interface DynamoDbTableProps extends BaseProps {
  name: string;
  partitionKeyName?: string;
  sortKeyName?: string;
  hasSortKey?: boolean;
}

export class DynamoDbTable extends Construct {
  readonly table: TableV2;

  constructor(scope: Construct, id: string, props: DynamoDbTableProps) {
    super(scope, id);
    const {
      name,
      partitionKeyName = "pk",
      sortKeyName = "sk",
      hasSortKey = true,
      ...baseProps
    } = props;

    const tableName = resourceName(baseProps, name);

    const table = new TableV2(this, tableName, {
      tableName: tableName,
      partitionKey: { name: partitionKeyName, type: AttributeType.STRING },
      billing: Billing.onDemand(),
      removalPolicy: RemovalPolicy.RETAIN,
      deletionProtection: false,
      sortKey: hasSortKey
        ? { name: sortKeyName, type: AttributeType.STRING }
        : undefined,
      pointInTimeRecovery: false,
      tableClass: TableClass.STANDARD,
      timeToLiveAttribute: "timeToLive",
    });

    this.table = table;
  }
}
