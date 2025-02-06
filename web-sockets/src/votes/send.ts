import { IItem } from "../../../common/core/src/models/item";
import { DynamoDBStreamEvent } from "aws-lambda";
import { postToConnectionAsync } from "common/core/src/services/apiGatewayClient";
import {
    deleteItemDocumentAsync,
    getItemDocumentsAsync,
    unmarshallItem,
} from "common/core/src/services/dynamoDbClient";
import { IWsEntity, WsEntity } from "common/core/src/models/wsEntity";
import { IVoteDbEntity, VoteDto } from "common/core/src/models/vote";
import { IDynamoDbItem } from "common/core/src/models/dynamoDbItem";
import { IVote } from "common/models/vote";

const TABLE_NAME = process.env.TABLE_NAME;
const WS_ENDPOINT = process.env.WS_ENDPOINT;

export const lambdaHandler = async (event: DynamoDBStreamEvent) => {
    try {
        for (const record of event.Records) {
            const event = record.eventName;
            let image: IDynamoDbItem | undefined;
            if (event === "REMOVE") {
                image = record.dynamodb?.OldImage as IDynamoDbItem;
            } else {
                image = record.dynamodb?.NewImage as IDynamoDbItem;
            }

            if (event && image) {
                const voteEntity = unmarshallItem<IVoteDbEntity>(image);
                const vote = new VoteDto(voteEntity);
                const wsVote: IWsEntity<IVote> = new WsEntity<IVote>(event, vote);

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
