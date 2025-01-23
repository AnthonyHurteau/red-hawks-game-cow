import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { IPlayerDbEntity, PlayerDto } from "/opt/nodejs/core/src/models/player";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PlayerType } from "common/models/player";

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

const isPlayerType = (type: string): type is PlayerType => {
    return ["core", "sub"].includes(type);
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.queryStringParameters) {
        try {
            const type = event.queryStringParameters.type;

            if (type && isPlayerType(type)) {
                const result = await dynamoDbClient.getDocumentsByPrimaryKeyAsync<IPlayerDbEntity>(type);

                if (result && result.length > 0) {
                    const playerDtos = result.map((playerDbEntity) => new PlayerDto(playerDbEntity));
                    return {
                        statusCode: 200,
                        body: JSON.stringify(playerDtos),
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
