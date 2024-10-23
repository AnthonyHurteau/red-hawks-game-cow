import { DynamoDB } from "aws-sdk";
import { DbEntity, DbEntityInit } from "../models/dbEntity";
import { BaseEntity } from "../../../common/models/baseEntity";
import { PkType } from "../models/pkTypes";

export class DynamoDbClient {
    private readonly dynamoDbDocumentClient: DynamoDB.DocumentClient;
    private readonly tableName: string;

    constructor(tableName: string) {
        this.dynamoDbDocumentClient = new DynamoDB.DocumentClient();
        this.tableName = tableName;
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
        try {
            const results = await this.dynamoDbDocumentClient.query(params).promise();

            return results.Items as T[];
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async createDocumentAsync<T extends BaseEntity>(item: T): Promise<T | undefined> {
        item.id = crypto.randomUUID();

        let entity = new DbEntityInit();
        entity = { ...entity, ...item };
        entity.created = new Date().toISOString();
        entity.modified = new Date().toISOString();

        const params = {
            TableName: this.tableName,
            Item: entity,
        };
        try {
            await this.dynamoDbDocumentClient.put(params).promise();
            return item;
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async updateDocumentAsync<T extends BaseEntity>(pkType: PkType, id: string, item: T): Promise<T | undefined> {
        try {
            let entity = await this.getDocumentAsync(pkType, id);

            if (entity) {
                entity = { ...entity, ...item };
                entity.modified = new Date().toISOString();

                const pk = this.partitionKey(pkType);
                const params = {
                    TableName: this.tableName,
                    Item: entity,
                    Key: { pk, id },
                };

                await this.dynamoDbDocumentClient.put(params).promise();
                return item;
            }
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async deleteDocumentAsync(pkType: PkType, id: string): Promise<boolean | undefined> {
        try {
            const entity = await this.getDocumentAsync(pkType, id);

            if (entity) {
                const pk = this.partitionKey(pkType);
                const params = {
                    TableName: this.tableName,
                    Key: { pk, id },
                };

                await this.dynamoDbDocumentClient.delete(params).promise();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    private partitionKey = (type: PkType): string => `Type#${type}`;
}
