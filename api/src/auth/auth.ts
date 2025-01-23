import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { deleteAsync, getAsync, postAsync } from "/opt/nodejs/core/src/services/httpHelper";
import { IAuth } from "common/models/auth";
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
    try {
        const authUser = JSON.parse(event.body as string) as IAuth;

        if (authUser.password === process.env.ADMIN_PASSWORD) {
            const url = process.env.USERS_ENDPOINT;

            // The user type is the actual sort key of the user in DynamoDB
            // Because dynamoDB doesn't allow the modification of sortkeys, we need to delete the user and create a new one
            const deleteUrl = `${url}/${authUser.id}`;
            const deleteResult = await deleteAsync<IUser>(deleteUrl);
            if (deleteResult.status === 200) {
                authUser.type = "admin";
                const result = await postAsync<IUser>(url, authUser);

                return {
                    statusCode: 200,
                    body: JSON.stringify(result),
                };
            }
        }
        return {
            statusCode: 403,
            body: JSON.stringify({
                message: "Unauthorized",
            }),
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
