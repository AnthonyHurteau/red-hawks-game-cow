import { IItem } from "../../../common/core/src/models/item";
import { DynamoDBStreamEvent } from "aws-lambda";
import { postToConnectionAsync } from "common/core/src/services/apiGatewayClient";
import {
    deleteItemDocumentAsync,
    getItemDocumentsAsync,
    unmarshallItem,
} from "common/core/src/services/dynamoDbClient";
import { IWsEntity, WsEntity } from "common/core/src/models/wsEntity";
import { GameDto, IGameDbEntity } from "common/core/src/models/game";
import { IDynamoDbItem } from "common/core/src/models/dynamoDbItem";
import { IGame } from "common/models/game";

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
                const gameEntity = unmarshallItem<IGameDbEntity>(image);
                const game = new GameDto(gameEntity);
                const wsGame: IWsEntity<IGame> = new WsEntity<IGame>(event, game);

                const connections = await getItemDocumentsAsync<IItem>(TABLE_NAME);
                if (connections && connections.length > 0) {
                    const postCalls = connections.map(async (connection) => {
                        try {
                            await postToConnectionAsync(connection.pk, wsGame, WS_ENDPOINT);
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
