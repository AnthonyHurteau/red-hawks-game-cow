import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GameType, IGame } from "common/models/game";
import { GameDbEntity, GameDto, IGameDbEntity } from "common/core/src/models/game";
import {
    createDocumentAsync,
    deleteDocumentAsync,
    getDocumentsByPrimaryKeyAsync,
} from "common/core/src/services/dynamoDbClient";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const TABLE_NAME = process.env.TABLE_NAME;
const ACTIVE: GameType = "active";

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        await managePreviousActiveGame();

        const game = JSON.parse(event.body as string) as IGame;

        const gameDbEntity = new GameDbEntity(game);
        await createDocumentAsync<IGameDbEntity>(gameDbEntity, TABLE_NAME);
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

const managePreviousActiveGame = async () => {
    const previousActiveGames = await getDocumentsByPrimaryKeyAsync<IGameDbEntity>(ACTIVE, TABLE_NAME);

    // Manage the previous active game.. there can only be one active game
    if (previousActiveGames) {
        for (const previousActiveGame of previousActiveGames) {
            // Because the active state is the PK, we need to delete the active and create it again
            const previousActiveGameDto = new GameDto(previousActiveGame);
            await deleteDocumentAsync<IGame>(previousActiveGameDto, TABLE_NAME);
            previousActiveGameDto.type = "completed";
            const gameDbEntity = new GameDbEntity(previousActiveGameDto);
            await createDocumentAsync<IGameDbEntity>(gameDbEntity, TABLE_NAME);
        }
    }
};
