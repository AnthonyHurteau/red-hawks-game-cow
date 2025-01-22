import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GameType } from "common/models/game";
import { GameDto, IGameDbEntity } from "/opt/nodejs/core/src/models/game";

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
    if (event.queryStringParameters) {
        try {
            const type = event.queryStringParameters.type;

            if (type === active) {
                const result = await dynamoDbClient.getDocumentsByPrimaryKeyAsync<IGameDbEntity>(active);

                if (result) {
                    const gameDto = new GameDto(result[0]);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(gameDto),
                    };
                } else {
                    return {
                        statusCode: 204,
                        body: "No content",
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
