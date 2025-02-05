import { IItem } from "../../../common/core/src/models/item";
import { DynamoDBStreamEvent } from "aws-lambda";
import { postToConnectionAsync } from "common/core/src/services/apiGatewayClient";
import { deleteItemDocumentAsync, getItemDocumentsAsync } from "common/core/src/services/dynamoDbClient";
import { IWsEntity, WsEntity } from "common/core/src/models/wsEntity";
import { IVote } from "common/models/vote";

const TABLE_NAME = process.env.TABLE_NAME;
const WS_ENDPOINT = process.env.ENDPOINT;

export const lambdaHandler = async (event: DynamoDBStreamEvent) => {
    try {
        for (const record of event.Records) {
            const event = record.eventName;
            const image = record.dynamodb?.NewImage;

            if (event && image) {
                const vote = image as unknown as IVote;
                const wsVote: IWsEntity = new WsEntity(event, vote);

                const connections = await getItemDocumentsAsync<IItem>(TABLE_NAME);
                if (connections && connections.length > 0) {
                    const postCalls = connections.map(async (connection) => {
                        try {
                            await postToConnectionAsync(connection.pk, wsVote, WS_ENDPOINT);
                        } catch (err: any) {
                            if (err.statusCode === 410) {
                                console.log(`Found stale connection, deleting ${connection.pk}`);
                                const item: IItem = { pk: connection.pk };
                                await deleteItemDocumentAsync<IItem>(item, TABLE_NAME);
                            } else {
                                console.error(err);
                            }
                        }
                    });
                    await Promise.all(postCalls);
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
};
