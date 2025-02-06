import { IDbEntity } from "../models/dbEntity";
import { IBaseEntity } from "common/models/baseEntity";
import { IItem } from "../models/item";
import { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb";
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
    try {
        const result = await dynamoDBDocumentClient.send(command);

        if (result.Items) {
            return result.Items as T[];
        }
    } catch (error) {
        console.error(error);
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
    try {
        const result = await dynamoDBDocumentClient.send(command);
        return result.Item as T;
    } catch (error) {
        console.error(error);
    }
};

export const getDocumentsAsync = async <T extends IDbEntity>(tableName: string): Promise<T[] | undefined> => {
    const input: ScanCommandInput = {
        TableName: tableName,
    };
    const command = new ScanCommand(input);
    try {
        const result = await dynamoDBDocumentClient.send(command);

        return result.Items as T[];
    } catch (error) {
        console.error(error);
    }
};

export const getItemDocumentsAsync = async <T extends IItem>(tableName: string): Promise<T[] | undefined> => {
    const input: ScanCommandInput = {
        TableName: tableName,
    };
    const command = new ScanCommand(input);
    try {
        const result = await dynamoDBDocumentClient.send(command);

        return result.Items as T[];
    } catch (error) {
        console.error(error);
    }
};

export const createDocumentAsync = async <T extends IDbEntity>(entity: T, tableName: string) => {
    const input: PutCommandInput = {
        TableName: tableName,
        Item: entity,
    };
    const command = new PutCommand(input);
    try {
        await dynamoDBDocumentClient.send(command);
    } catch (error) {
        console.error(error);
    }
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
    const command = new BatchWriteCommand(input);
    try {
        await dynamoDBDocumentClient.send(command);
    } catch (error) {
        console.error(error);
    }
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
        try {
            await dynamoDBDocumentClient.send(command);
        } catch (error) {
            console.error(error);
        }
    }
};

export const updateItemDocumentAsync = async <T extends IItem>(item: T, tableName: string) => {
    const input: PutCommandInput = {
        TableName: tableName,
        Item: item,
    };
    const command = new PutCommand(input);
    try {
        await dynamoDBDocumentClient.send(command);
    } catch (error) {
        console.error(error);
    }
};

export const deleteDocumentAsync = async <T extends IBaseEntity>(entity: T, tableName: string) => {
    const input: DeleteCommandInput = {
        TableName: tableName,
        Key: { pk: entity.dbEntityPrimaryKey, sk: entity.dbEntitySortKey },
    };
    const command = new DeleteCommand(input);
    try {
        await dynamoDBDocumentClient.send(command);
    } catch (error) {
        console.error(error);
    }
};

export const deleteItemDocumentAsync = async <T extends IItem>(item: T, tableName: string) => {
    const input: DeleteCommandInput = {
        TableName: tableName,
        Key: { pk: item.pk },
    };
    const command = new DeleteCommand(input);
    try {
        await dynamoDBDocumentClient.send(command);
    } catch (error) {
        console.error(error);
    }
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
    const command = new BatchWriteCommand(input);
    try {
        await dynamoDBDocumentClient.send(command);
    } catch (error) {
        console.error(error);
    }
};

export const unmarshallItem = <T extends IDbEntity>(item: IDynamoDbItem): T => {
    const unmarshalledEntity = unmarshall(item) as T;
    return unmarshalledEntity;
};
