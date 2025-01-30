import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDbClient } from "common/core/src/services/dynamoDbClient";
import { IVoteDbEntity, VoteDto } from "common/core/src/models/vote";

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

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    if (event.pathParameters && event.pathParameters.userId) {
        try {
            const userId = event.pathParameters.userId;
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
