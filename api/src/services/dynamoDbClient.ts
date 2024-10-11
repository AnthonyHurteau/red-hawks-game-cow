import { DynamoDB } from "aws-sdk";
import { DbEntity } from "../models/dbEntity";
import { BaseEntity } from "../models/baseEntity";
import { PkType } from "../models/pkTypes";

export class DynamoDbClient {
    private readonly dynamoDbDocumentClient: DynamoDB.DocumentClient;
    private readonly tableName: string;

    constructor() {
        this.dynamoDbDocumentClient = new DynamoDB.DocumentClient();
        this.tableName = process.env.TABLE_NAME;
    }

    async getDocumentAsync<T extends DbEntity>(pkType: PkType, id: string): Promise<T | undefined> {
        const pk = this.partitionKey(pkType);
        const params = {
            TableName: this.tableName,
            Key: { pk, id },
        };
        try {
            const result = await this.dynamoDbDocumentClient.get(params).promise();
            return result.Item as Promise<T>;
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async getDocumentsAsync<T extends BaseEntity>(pkType: PkType): Promise<T[] | undefined> {
        const pk = this.partitionKey(pkType);
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: {
                ":pk": pk,
            },
        };
        console.log(params);
        try {
            const results = await this.dynamoDbDocumentClient.query(params).promise();

            return results.Items as T[];
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    private partitionKey = (type: PkType): string => `Type#${type}`;
}
