import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { IUser } from "common/models/user";
import { IUserDbEntity, UserDbEntity, UserDto } from "/opt/nodejs/core/src/models/user";
import { timeToLive } from "/opt/nodejs/core/src/services/timeToLiveHelper";

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
        const user = JSON.parse(event.body as string) as IUser;

        const ttl = timeToLive(6, "months");
        const userDbEntity = new UserDbEntity(user, ttl);

        await dynamoDbClient.createDocumentAsync<IUserDbEntity>(userDbEntity);
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
