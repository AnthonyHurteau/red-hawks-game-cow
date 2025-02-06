import { AttributeValue } from "@aws-sdk/client-dynamodb";

export interface IDynamoDbItem {
    [key: string]: AttributeValue;
}
