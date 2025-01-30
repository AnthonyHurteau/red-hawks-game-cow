import { IDbEntity } from "../models/dbEntity";
import { IBaseEntity } from "common/models/baseEntity";
import { IItem } from "../models/item";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    QueryCommand,
    QueryCommandInput,
    ScanCommand,
    BatchWriteCommand,
    BatchWriteCommandInput,
    DeleteCommand,
    DeleteCommandInput,
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    PutCommand,
    PutCommandInput,
    ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";

export class DynamoDbClient {
    private readonly dynamoDBDocumentClient: DynamoDBDocumentClient;
    private readonly tableName: string;

    constructor(tableName: string) {
        if (!tableName) {
            throw new Error("Table Name cannot be null or undefined.");
        }

        const dynamoDbClient = new DynamoDBClient({});
        this.dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);
        this.tableName = tableName;
    }

    async getDocumentsByPrimaryKeyAsync<T extends IDbEntity>(pk: string): Promise<T[] | undefined> {
        const input: QueryCommandInput = {
            TableName: this.tableName,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: {
                ":pk": pk,
            },
        };
        const command = new QueryCommand(input);
        try {
            const result = await this.dynamoDBDocumentClient.send(command);

            if (result.Items) {
                return result.Items as unknown as T[];
            }
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async getDocumentBySortKeyAsync<T extends IDbEntity>(pk: string, sk: string): Promise<T | undefined> {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: { pk, sk },
        };
        const command = new GetCommand(input);
        try {
            const result = await this.dynamoDBDocumentClient.send(command);
            return result.Item as T;
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async getDocumentsAsync<T extends IDbEntity>(): Promise<T[] | undefined> {
        const input: ScanCommandInput = {
            TableName: this.tableName,
        };
        const command = new ScanCommand(input);
        try {
            const result = await this.dynamoDBDocumentClient.send(command);

            return result.Items as unknown as T[];
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async getItemDocumentsAsync<T extends IItem>(): Promise<T[] | undefined> {
        const input: ScanCommandInput = {
            TableName: this.tableName,
        };
        const command = new ScanCommand(input);
        try {
            const result = await this.dynamoDBDocumentClient.send(command);

            return result.Items as unknown as T[];
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async createDocumentAsync<T extends IDbEntity>(entity: T) {
        const input: PutCommandInput = {
            TableName: this.tableName,
            Item: entity,
        };
        const command = new PutCommand(input);
        try {
            await this.dynamoDBDocumentClient.send(command);
        } catch (error) {
            console.error(error);
        }
    }

    async createDocumentsAsync<T extends IDbEntity>(entities: T[]) {
        const input: BatchWriteCommandInput = {
            RequestItems: {
                [this.tableName]: entities.map((entity) => ({
                    PutRequest: {
                        Item: entity,
                    },
                })),
            },
        };
        const command = new BatchWriteCommand(input);
        try {
            await this.dynamoDBDocumentClient.send(command);
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

            const input: PutCommandInput = {
                TableName: this.tableName,
                Item: dbEntity,
            };
            const command = new PutCommand(input);
            try {
                await this.dynamoDBDocumentClient.send(command);
            } catch (error) {
                console.error(error);
            }
        }
    }

    async updateItemDocumentAsync<T extends IItem>(item: T) {
        const input: PutCommandInput = {
            TableName: this.tableName,
            Item: item,
        };
        const command = new PutCommand(input);
        try {
            await this.dynamoDBDocumentClient.send(command);
        } catch (error) {
            console.error(error);
        }
    }

    async deleteDocumentAsync<T extends IBaseEntity>(entity: T) {
        const input: DeleteCommandInput = {
            TableName: this.tableName,
            Key: { pk: entity.dbEntityPrimaryKey, sk: entity.dbEntitySortKey },
        };
        const command = new DeleteCommand(input);
        try {
            await this.dynamoDBDocumentClient.send(command);
        } catch (error) {
            console.error(error);
        }
    }

    async deleteItemDocumentAsync<T extends IItem>(item: T) {
        const input: DeleteCommandInput = {
            TableName: this.tableName,
            Key: { pk: item.pk },
        };
        const command = new DeleteCommand(input);
        try {
            await this.dynamoDBDocumentClient.send(command);
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

        const input: BatchWriteCommandInput = {
            RequestItems: {
                [this.tableName]: deleteRequests,
            },
        };
        const command = new BatchWriteCommand(input);
        try {
            await this.dynamoDBDocumentClient.send(command);
        } catch (error) {
            console.error(error);
        }
    }
}
