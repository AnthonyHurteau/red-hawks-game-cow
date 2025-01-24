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

        // Manage the previous active game.. there can only be one active game
        if (previousActiveGames) {
            for (const previousActiveGame of previousActiveGames) {
                // Because the active state is the PK, we need to delete the active and create it again
                const previousActiveGameDto = new GameDto(previousActiveGame);

                const gamesUrl = `${process.env.GAMES_ENDPOINT}/${previousActiveGameDto.id}?type=${active}`;
                const deletepreviousActiveGameResult = await deleteAsync<IGame>(gamesUrl);

                if (![200, 204].includes(deletepreviousActiveGameResult.status)) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({
                            message: "Error deleting previous active game",
                        }),
                    };
                }

                previousActiveGameDto.type = "completed";
                const gameDbEntity = new GameDbEntity(previousActiveGameDto);
                await dynamoDbClient.createDocumentAsync<IGameDbEntity>(gameDbEntity);
            }
        }

        const game = JSON.parse(event.body as string) as IGame;

        // There are two creation mecanisms, this section if for new active games only
        if (game.type === active) {
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

            if (![200, 204].includes(deleteAllVotesresult.status)) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: "Error deleting votes",
                    }),
                };
            }

            game.players = corePlayers;
        }

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
