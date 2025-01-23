import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { postAsync } from "/opt/nodejs/core/src/services/httpHelper";
import { IAuth } from "common/models/auth";
import { IUser, User } from "common/models/user";

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
        const userAuth = JSON.parse(event.body as string) as IAuth;

        if (userAuth.password === process.env.ADMIN_PASSWORD) {
            const adminUser: IUser = new User(userAuth.userId, "admin");
            const url = process.env.CREATE_USER_ENDPOINT;
            const result = await postAsync<IUser>(url, adminUser);

            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
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
