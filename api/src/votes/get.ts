import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { IVoteDbEntity, VoteDto } from "/opt/nodejs/core/src/models/vote";

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
    if (event.queryStringParameters && event.queryStringParameters.userId) {
        try {
            const userId = event.queryStringParameters.userId;
            const result = await dynamoDbClient.getDocumentsByPrimaryKeyAsync<IVoteDbEntity>(userId);

            if (result && result.length > 0) {
                const voteDto = new VoteDto(result[0]);
                return {
                    statusCode: 200,
                    body: JSON.stringify(voteDto),
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
