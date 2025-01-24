import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { GameType, IGame } from "common/models/game";
import { GameDbEntity, GameDto, IGameDbEntity } from "/opt/nodejs/core/src/models/game";
import { deleteAsync, getAsync } from "/opt/nodejs/core/src/services/httpHelper";
import { IPlayer } from "common/models/player";
import { IVote } from "common/models/vote";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const dynamoDbClient = new DynamoDbClient(process.env.TABLE_NAME as string);

const active: GameType = "active";

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const previousActiveGames = await dynamoDbClient.getDocumentsByPrimaryKeyAsync<IGameDbEntity>(active);

        if (previousActiveGames && previousActiveGames.length > 0) {
            for (const previousActiveGame of previousActiveGames) {
                if (previousActiveGame.isVoteComplete) {
                    const gameDto = new GameDto(previousActiveGame);
                    gameDto.type = "completed";
                    await dynamoDbClient.updateDocumentAsync<IGame>(gameDto);
                } else {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: "There is an active vote in progress",
                        }),
                    };
                }
            }
        }

        const playersUrl = `${process.env.PLAYERS_ENDPOINT}?type=core`;
        const corePlayers = await getAsync<IPlayer[]>(playersUrl);

        if (!corePlayers) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Error fetching core players",
                }),
            };
        }

        const votesUrl = `${process.env.VOTES_ENDPOINT}/all`;
        const deleteAllVotesresult = await deleteAsync<IVote[]>(votesUrl);

        if (deleteAllVotesresult.status !== 200) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Error deleting votes",
                }),
            };
        }

        const game = JSON.parse(event.body as string) as IGame;
        game.players = corePlayers;
        const gameDbEntity = new GameDbEntity(game);
        await dynamoDbClient.createDocumentAsync<IGameDbEntity>(gameDbEntity);
        const gameDto = new GameDto(gameDbEntity);

        return {
            statusCode: 200,
            body: JSON.stringify(gameDto),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Bad Request",
            }),
        };
    }
};
