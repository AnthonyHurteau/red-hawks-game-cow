import { AWSError, DynamoDB } from "aws-sdk";
import { IDbEntity } from "../models/dbEntity";
import { IBaseEntity } from "common/models/baseEntity";

export class DynamoDbClient {
    private readonly dynamoDbDocumentClient: DynamoDB.DocumentClient;
    private readonly tableName: string;

    constructor(tableName: string) {
        if (!tableName) {
            throw new Error("Table Name cannot be null or undefined.");
        }

        this.dynamoDbDocumentClient = new DynamoDB.DocumentClient();
        this.tableName = tableName;
    }

    async getDocumentsByPrimaryKeyAsync<T extends IDbEntity>(pk: string): Promise<T[] | undefined> {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: {
                ":pk": pk,
            },
        };
        try {
            const result = await this.dynamoDbDocumentClient.query(params).promise();
            if (result.Items) {
                return result.Items as T[];
            }
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async getDocumentBySortKeyAsync<T extends IDbEntity>(pk: string, sk: string): Promise<T | undefined> {
        const params = {
            TableName: this.tableName,
            Key: { pk, sk },
        };

        try {
            const result = await this.dynamoDbDocumentClient.get(params).promise();
            return result.Item as T;
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async getDocumentsAsync<T extends IDbEntity>(): Promise<T[] | undefined> {
        const params = {
            TableName: this.tableName,
        };

        try {
            const result = await this.dynamoDbDocumentClient.scan(params).promise();

            return result.Items as T[];
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async createDocumentAsync<T extends IDbEntity>(entity: T) {
        const params = {
            TableName: this.tableName,
            Item: entity,
        };
        try {
            await this.dynamoDbDocumentClient.put(params).promise();
        } catch (error) {
            console.error(error);
        }
    }

    async createDocumentsAsync<T extends IDbEntity>(entities: T[]) {
        const params = {
            RequestItems: {
                [this.tableName]: entities.map((entity) => ({
                    PutRequest: {
                        Item: entity,
                    },
                })),
            },
        };

        try {
            await this.dynamoDbDocumentClient.batchWrite(params).promise();
        } catch (error) {
            console.error(error);
        }
    }

    async updateDocumentAsync<T extends IBaseEntity>(entity: T) {
        let dbEntity = await this.getDocumentBySortKeyAsync<IDbEntity>(
            entity.dbEntityPrimaryKey,
            entity.dbEntitySortKey,
        );
        if (dbEntity) {
            dbEntity.modified = new Date().toISOString();
            dbEntity = { ...dbEntity, ...entity };

            const params = {
                TableName: this.tableName,
                Item: dbEntity,
                Key: { pk: dbEntity.pk, sk: dbEntity.sk },
            };

            try {
                await this.dynamoDbDocumentClient.put(params).promise();
            } catch (error) {
                console.error(error);
            }
        }
    }

    async deleteDocumentAsync<T extends IBaseEntity>(entity: T) {
        const params = {
            TableName: this.tableName,
            Key: { pk: entity.dbEntityPrimaryKey, sk: entity.dbEntitySortKey },
        };
        try {
            await this.dynamoDbDocumentClient.delete(params).promise();
        } catch (error) {
            console.error(error);
        }
    }

    async deleteDocumentsAsync<T extends IBaseEntity>(entities: T[]) {
        const deleteRequests = entities.map((entity) => ({
            DeleteRequest: {
                Key: { pk: entity.dbEntityPrimaryKey, sk: entity.dbEntitySortKey },
            },
        }));

        const params = {
            RequestItems: {
                [this.tableName]: deleteRequests,
            },
        };

        try {
            await this.dynamoDbDocumentClient.batchWrite(params).promise();
        } catch (error) {
            console.error(error);
        }
    }
}
