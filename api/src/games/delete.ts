import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { GameDto, IGameDbEntity } from "/opt/nodejs/core/src/models/game";
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

const dynamoDbClient = new DynamoDbClient(process.env.TABLE_NAME as string);

const isGameType = (type: string): type is GameType => {
    return ["active", "completed"].includes(type);
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
                const game = await dynamoDbClient.getDocumentBySortKeyAsync<IGameDbEntity>(type, id);
                if (game) {
                    const gameDto = new GameDto(game);
                    await dynamoDbClient.deleteDocumentAsync<IGame>(gameDto);
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
