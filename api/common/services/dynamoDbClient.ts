import { DynamoDB } from "aws-sdk";
import { DbEntity, DbEntityInit, indexKey, partitionKey } from "../models/dbEntity";
import { BaseEntity } from "../../../common/models/baseEntity";
import { PkType } from "../models/pkTypes";
import { IndexType } from "../models/indexTypes";

export class DynamoDbClient {
    private readonly dynamoDbDocumentClient: DynamoDB.DocumentClient;
    private readonly tableName: string;

    constructor(tableName: string) {
        this.dynamoDbDocumentClient = new DynamoDB.DocumentClient();
        this.tableName = tableName;
    }

    async getDocumentAsync<T extends BaseEntity>(pkType: PkType, id: string): Promise<T | undefined> {
        const pk = partitionKey(pkType);
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
        const pk = partitionKey(pkType);
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: {
                ":pk": pk,
            },
        };

        try {
            const result = await this.dynamoDbDocumentClient.query(params).promise();

            return result.Items as T[];
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async getDocumentsByIndexAsync<T extends BaseEntity>(
        pkType: PkType,
        indexKeyAttribute: IndexType,
        indexValue: string,
    ): Promise<T[] | undefined> {
        const pk = partitionKey(pkType);
        const indexName = indexKey(indexKeyAttribute);

        const params = {
            TableName: this.tableName,
            IndexName: indexName,
            KeyConditionExpression: "#pk = :pkValue AND #indexKey = :indexValue",
            ExpressionAttributeNames: {
                "#pk": "pk",
                "#indexKey": indexKeyAttribute,
            },
            ExpressionAttributeValues: {
                ":pkValue": pk,
                ":indexValue": indexValue,
            },
        };

        try {
            const result = await this.dynamoDbDocumentClient.query(params).promise();
            return result.Items as T[];
        } catch (error) {
            console.error(error);
        }

        return undefined;
    }

    async createDocumentAsync<T extends BaseEntity>(
        pkType: PkType,
        item: T,
        timeToLive: number | null = null,
    ): Promise<T | undefined> {
        let entity = new DbEntityInit(pkType);

        if (timeToLive) {
            entity.timeToLive = timeToLive;
        }
        // Because the front end sends the id as an empty string, we need to assign the entity id so that it doesn't get
        // overwritten by the item id when we merge the two objects using the spread operator.
        if (item.id === "") {
            item.id = entity.id;
        }

        entity = { ...entity, ...item };

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
            let entity = (await this.getDocumentAsync(pkType, id)) as T & DbEntity;

            if (entity) {
                entity = { ...entity, ...item };
                entity.modified = new Date().toISOString();

                const pk = partitionKey(pkType);
                const params = {
                    TableName: this.tableName,
                    Item: entity,
                    Key: { pk, id },
                };

                await this.dynamoDbDocumentClient.put(params).promise();
                return item;
            } else {
                console.warn(`${pkType} entity with id ${id} not found`);
                return undefined;
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
                const pk = partitionKey(pkType);
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
}
