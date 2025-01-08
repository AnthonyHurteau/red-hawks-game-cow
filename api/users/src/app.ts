import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "../../common/services/dynamoDbClient";
import { HttpVerbs } from "../../common/enums/httpVerbs";
import { Auth } from "../../../common/models/auth";
import { User } from "../../../common/models/user";
import { timeToLive } from "../../common/services/timeToLiveHelper";

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
    if (event.httpMethod === HttpVerbs.GET) {
        if (event.queryStringParameters) {
            try {
                const userId = event.queryStringParameters.userId;

                if (userId) {
                    const result = await dynamoDbClient.getDocumentAsync<User>("User", userId);

                    if (result) {
                        return {
                            statusCode: 200,
                            body: JSON.stringify(result),
                        };
                    } else {
                        return {
                            statusCode: 204,
                            body: "",
                        };
                    }
                } else {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: "Missing userId",
                        }),
                    };
                }
            } catch (err) {
                console.error(err);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Error fetching user",
                    }),
                };
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing userId",
                }),
            };
        }
    } else if (event.httpMethod === HttpVerbs.POST) {
        try {
            const userAuth = JSON.parse(event.body as string) as Auth;

            if (userAuth.password !== process.env.ADMIN_PASSWORD) {
                return {
                    statusCode: 403,
                    body: JSON.stringify({
                        message: "Unauthorized",
                    }),
                };
            }

            const adminUser: User = {
                id: userAuth.userId,
                isAdmin: true,
            };

            const ttl = timeToLive(6, "months");

            await dynamoDbClient.createDocumentAsync<User>("User", adminUser, ttl);

            userAuth.isAdmin = true;

            return {
                statusCode: 200,
                body: JSON.stringify(userAuth),
            };
        } catch (err) {
            console.error(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error creating game",
                }),
            };
        }
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({
                message: "Method not allowed",
            }),
        };
    }
};
