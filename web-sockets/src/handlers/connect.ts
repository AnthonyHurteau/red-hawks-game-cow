import { Connection } from "types/connection";
import { IItem } from "../../../common/core/src/models/item";
import { DynamoDbClient } from "common/core/src/services/dynamoDbClient";
import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { timeToLive } from "../../../common/core/src/services/timeToLiveHelper";

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

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    try {
        const connectionId = event.requestContext.connectionId;
        if (connectionId) {
            const ttl = timeToLive(2, "days");
            const connection = new Connection(connectionId, ttl);
            await dynamoDbClient.updateItemDocumentAsync<IItem>(connection);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Connected",
                }),
            };
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

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad Request",
        }),
    };
};
