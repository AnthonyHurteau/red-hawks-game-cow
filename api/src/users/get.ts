import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IUserDbEntity, UserDto } from "common/core/src/models/user";
import { getDocumentsByPrimaryKeyAsync } from "common/core/src/services/dynamoDbClient";

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
    if (event.pathParameters && event.pathParameters.id) {
        try {
            const id = event.pathParameters.id;
            const result = await getDocumentsByPrimaryKeyAsync<IUserDbEntity>(id, TABLE_NAME);

            if (result && result.length > 0) {
                const userDto = new UserDto(result[0]);
                return {
                    statusCode: 200,
                    body: JSON.stringify(userDto),
                };
            } else {
                return {
                    statusCode: 204,
                    body: "No content",
                };
            }
        } catch (error) {
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
