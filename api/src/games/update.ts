import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { updateDocumentAsync } from "common/core/src/services/dynamoDbClient";
import { Game, IGame } from "common/models/game";

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

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const body = JSON.parse(event.body as string) as IGame;
        const game = new Game(body);

        await updateDocumentAsync<IGame>(game, TABLE_NAME);

        return {
            statusCode: 200,
            body: JSON.stringify(game),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error updating active game",
            }),
        };
    }
};
