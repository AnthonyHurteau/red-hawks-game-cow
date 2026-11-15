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
    BatchWriteCommandOutput,
    DeleteCommand,
    DeleteCommandInput,
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    PutCommand,
    PutCommandInput,
    ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { IDynamoDbItem } from "src/models/dynamoDbItem";

const dynamoDbClient = new DynamoDBClient({});
const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const getDocumentsByPrimaryKeyAsync = async <T extends IDbEntity>(
    pk: string,
    tableName: string,
): Promise<T[] | undefined> => {
    const input: QueryCommandInput = {
        TableName: tableName,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
            ":pk": pk,
        },
    };
    const command = new QueryCommand(input);
    const result = await dynamoDBDocumentClient.send(command);

    if (result.Items) {
        return result.Items as T[];
    }
};

export const getDocumentBySortKeyAsync = async <T extends IDbEntity>(
    pk: string,
    sk: string,
    tableName: string,
): Promise<T | undefined> => {
    const input: GetCommandInput = {
        TableName: tableName,
        Key: { pk, sk },
    };
    const command = new GetCommand(input);
    const result = await dynamoDBDocumentClient.send(command);
    return result.Item as T;
};

export const getDocumentsAsync = async <T extends IDbEntity>(tableName: string): Promise<T[] | undefined> => {
    const input: ScanCommandInput = {
        TableName: tableName,
    };
    const command = new ScanCommand(input);
    const result = await dynamoDBDocumentClient.send(command);

    return result.Items as T[];
};

export const getItemDocumentsAsync = async <T extends IItem>(tableName: string): Promise<T[] | undefined> => {
    const input: ScanCommandInput = {
        TableName: tableName,
    };
    const command = new ScanCommand(input);
    const result = await dynamoDBDocumentClient.send(command);

    return result.Items as T[];
};

export const createDocumentAsync = async <T extends IDbEntity>(entity: T, tableName: string) => {
    const input: PutCommandInput = {
        TableName: tableName,
        Item: entity,
    };
    const command = new PutCommand(input);
    await dynamoDBDocumentClient.send(command);
};

export const createDocumentsAsync = async <T extends IDbEntity>(entities: T[], tableName: string) => {
    const input: BatchWriteCommandInput = {
        RequestItems: {
            [tableName]: entities.map((entity) => ({
                PutRequest: {
                    Item: entity,
                },
            })),
        },
    };
    await batchWriteAsync(input);
};

export const updateDocumentAsync = async <T extends IBaseEntity>(entity: T, tableName: string) => {
    let dbEntity = await getDocumentBySortKeyAsync<IDbEntity>(
        entity.dbEntityPrimaryKey,
        entity.dbEntitySortKey,
        tableName,
    );
    if (dbEntity) {
        dbEntity.modified = new Date().toISOString();
        dbEntity = { ...dbEntity, ...entity };

        const input: PutCommandInput = {
            TableName: tableName,
            Item: dbEntity,
        };
        const command = new PutCommand(input);
        await dynamoDBDocumentClient.send(command);
    }
};

export const updateItemDocumentAsync = async <T extends IItem>(item: T, tableName: string) => {
    const input: PutCommandInput = {
        TableName: tableName,
        Item: item,
    };
    const command = new PutCommand(input);
    await dynamoDBDocumentClient.send(command);
};

export const deleteDocumentAsync = async <T extends IBaseEntity>(entity: T, tableName: string) => {
    const input: DeleteCommandInput = {
        TableName: tableName,
        Key: { pk: entity.dbEntityPrimaryKey, sk: entity.dbEntitySortKey },
    };
    const command = new DeleteCommand(input);
    await dynamoDBDocumentClient.send(command);
};

export const deleteItemDocumentAsync = async <T extends IItem>(item: T, tableName: string) => {
    const input: DeleteCommandInput = {
        TableName: tableName,
        Key: { pk: item.pk },
    };
    const command = new DeleteCommand(input);
    await dynamoDBDocumentClient.send(command);
};

export const deleteDocumentsAsync = async <T extends IBaseEntity>(entities: T[], tableName: string) => {
    const deleteRequests = entities.map((entity) => ({
        DeleteRequest: {
            Key: { pk: entity.dbEntityPrimaryKey, sk: entity.dbEntitySortKey },
        },
    }));

    const input: BatchWriteCommandInput = {
        RequestItems: {
            [tableName]: deleteRequests,
        },
    };
    await batchWriteAsync(input);
};

// DynamoDB accepts at most 25 requests per BatchWriteItem call.
const BATCH_WRITE_LIMIT = 25;
const BATCH_WRITE_MAX_ATTEMPTS = 5;

/**
 * Writes every request, splitting into chunks of 25 and retrying any items DynamoDB
 * reports as unprocessed (e.g. throttling). Throws if anything is still unwritten.
 */
const batchWriteAsync = async (input: BatchWriteCommandInput) => {
    for (const [tableName, requests] of Object.entries(input.RequestItems ?? {})) {
        for (let i = 0; i < requests.length; i += BATCH_WRITE_LIMIT) {
            let pending: BatchWriteCommandInput["RequestItems"] = {
                [tableName]: requests.slice(i, i + BATCH_WRITE_LIMIT),
            };
            for (let attempt = 1; pending && Object.keys(pending).length > 0; attempt++) {
                if (attempt > BATCH_WRITE_MAX_ATTEMPTS) {
                    throw new Error(
                        `Batch write to ${tableName} left unprocessed items after ${BATCH_WRITE_MAX_ATTEMPTS} attempts`,
                    );
                }
                if (attempt > 1) {
                    await new Promise((resolve) => setTimeout(resolve, 50 * 2 ** attempt));
                }
                const result: BatchWriteCommandOutput = await dynamoDBDocumentClient.send(
                    new BatchWriteCommand({ RequestItems: pending }),
                );
                pending = result.UnprocessedItems;
            }
        }
    }
};

export const unmarshallItem = <T extends IDbEntity>(item: IDynamoDbItem): T => {
    const unmarshalledEntity = unmarshall(item) as T;
    return unmarshalledEntity;
};
