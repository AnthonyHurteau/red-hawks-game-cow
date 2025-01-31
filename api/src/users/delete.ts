import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IUserDbEntity, UserDto } from "common/core/src/models/user";
import { deleteDocumentAsync, getDocumentsByPrimaryKeyAsync } from "common/core/src/services/dynamoDbClient";
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

const TABLE_NAME = process.env.TABLE_NAME;

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    if (event.pathParameters && event.pathParameters.id) {
        try {
            const userId = event.pathParameters.id;

            const user = await getDocumentsByPrimaryKeyAsync<IUserDbEntity>(userId, TABLE_NAME);
            if (user && user.length > 0) {
                const userDto = new UserDto(user[0]);
                await deleteDocumentAsync<IUser>(userDto, TABLE_NAME);
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
