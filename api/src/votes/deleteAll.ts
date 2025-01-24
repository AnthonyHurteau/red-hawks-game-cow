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
    try {
        const existingVotes = await dynamoDbClient.getDocumentsAsync<IVoteDbEntity>();
        if (existingVotes && existingVotes.length > 0) {
            const existingVoteDtos = existingVotes.map((vote) => new VoteDto(vote));
            await dynamoDbClient.deleteDocumentsAsync(existingVoteDtos);
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
};
