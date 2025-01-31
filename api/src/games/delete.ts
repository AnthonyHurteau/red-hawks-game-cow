import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GameDto, IGameDbEntity } from "common/core/src/models/game";
import { deleteDocumentAsync, getDocumentBySortKeyAsync } from "common/core/src/services/dynamoDbClient";
import { GameType, IGame } from "common/models/game";

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

const isGameType = (type: string): type is GameType => {
    return ["active", "completed"].includes(type);
};

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    if (
        event.pathParameters &&
        event.pathParameters.id &&
        event.queryStringParameters &&
        event.queryStringParameters.type
    ) {
        try {
            const type = event.queryStringParameters.type;
            const id = event.pathParameters.id;

            if (isGameType(type)) {
                const game = await getDocumentBySortKeyAsync<IGameDbEntity>(type, id, TABLE_NAME);
                if (game) {
                    const gameDto = new GameDto(game);
                    await deleteDocumentAsync<IGame>(gameDto, TABLE_NAME);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: "Ok",
                        }),
                    };
                } else {
                    return {
                        statusCode: 204,
                        body: JSON.stringify({
                            message: "No Content",
                        }),
                    };
                }
            }
        } catch (err) {
            console.error(err);
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Bad Request",
                }),
            };
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad Request",
        }),
    };
};
