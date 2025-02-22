import { deleteItemDocumentAsync } from "common/core/src/services/dynamoDbClient";
import { IItem } from "../../../common/core/src/models/item";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

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

export const lambdaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        const connectionId = event.requestContext.connectionId;
        if (connectionId) {
            const item: IItem = { pk: connectionId };
            await deleteItemDocumentAsync<IItem>(item, TABLE_NAME);
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
