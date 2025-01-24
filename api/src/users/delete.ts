import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { IUserDbEntity, UserDto } from "/opt/nodejs/core/src/models/user";
import { IUser } from "common/models/user";

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

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.pathParameters && event.pathParameters.id) {
        try {
            const userId = event.pathParameters.id;

            const user = await dynamoDbClient.getDocumentsByPrimaryKeyAsync<IUserDbEntity>(userId);
            if (user && user.length > 0) {
                const userDto = new UserDto(user[0]);
                await dynamoDbClient.deleteDocumentAsync<IUser>(userDto);
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
