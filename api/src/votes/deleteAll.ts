import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IVoteDbEntity, VoteDto } from "common/core/src/models/vote";
import { deleteDocumentsAsync, getDocumentsAsync } from "common/core/src/services/dynamoDbClient";

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
        const existingVotes = await getDocumentsAsync<IVoteDbEntity>(TABLE_NAME);
        if (existingVotes && existingVotes.length > 0) {
            const existingVoteDtos = existingVotes.map((vote) => new VoteDto(vote));
            await deleteDocumentsAsync(existingVoteDtos, TABLE_NAME);
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
