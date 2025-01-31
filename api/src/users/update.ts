import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { updateDocumentAsync } from "common/core/src/services/dynamoDbClient";
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

const TABLE_NAME = process.env.TABLE_NAME;

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const body = JSON.parse(event.body as string) as IUser;
        const user = new User(body);
        await updateDocumentAsync<IUser>(user, TABLE_NAME);

        return {
            statusCode: 200,
            body: JSON.stringify(user),
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
