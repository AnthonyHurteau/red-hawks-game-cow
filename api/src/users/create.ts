import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IUser, User } from "common/models/user";
import { IUserDbEntity, UserDbEntity, UserDto } from "common/core/src/models/user";
import { timeToLive } from "common/core/src/services/timeToLiveHelper";
import { IAuth } from "common/models/auth";
import { createDocumentAsync, deleteDocumentAsync } from "common/core/src/services/dynamoDbClient";

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
        const user = JSON.parse(event.body as string) as IAuth;
        // Set user type to user by default
        user.type = "user";

        if (user.password) {
            if (user.password === process.env.ADMIN_PASSWORD) {
                const url = process.env.USERS_ENDPOINT;

                // The user type is the actual sort key of the user in DynamoDB
                // Because dynamoDB doesn't allow the modification of sortkeys, we need to delete the user and create a new one
                const deleteUser = new User(user);
                await deleteDocumentAsync<IUser>(deleteUser, TABLE_NAME);
                user.type = "admin";
            } else {
                return {
                    statusCode: 403,
                    body: JSON.stringify({
                        message: "Unauthorized",
                    }),
                };
            }
        }

        const ttl = timeToLive(6, "months");
        const userDbEntity = new UserDbEntity(user, ttl);

        await createDocumentAsync<IUserDbEntity>(userDbEntity, TABLE_NAME);
        const userDto = new UserDto(userDbEntity);

        return {
            statusCode: 200,
            body: JSON.stringify(userDto),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Bad Request",
            }),
        };
    }
};
