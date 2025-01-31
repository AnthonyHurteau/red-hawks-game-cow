import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IVote } from "common/models/vote";
import { IVoteDbEntity, VoteDto } from "common/core/src/models/vote";
import { deleteDocumentAsync, getDocumentsByPrimaryKeyAsync } from "common/core/src/services/dynamoDbClient";

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
    if (event.pathParameters && event.pathParameters.userId) {
        try {
            const userId = event.pathParameters.userId;

            const vote = await getDocumentsByPrimaryKeyAsync<IVoteDbEntity>(userId, TABLE_NAME);
            if (vote && vote.length > 0) {
                const voteDto = new VoteDto(vote[0]);
                await deleteDocumentAsync<IVote>(voteDto, TABLE_NAME);
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: "Ok",
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
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad Request",
        }),
    };
};
