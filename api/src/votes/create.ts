import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IVote } from "common/models/vote";
import { IVoteDbEntity, VoteDbEntity, VoteDto } from "common/core/src/models/vote";
import { createDocumentAsync } from "common/core/src/services/dynamoDbClient";

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
        const vote = JSON.parse(event.body as string) as IVote;
        const voteDbEntity = new VoteDbEntity(vote);
        await createDocumentAsync<IVoteDbEntity>(voteDbEntity, TABLE_NAME);

        const voteDto = new VoteDto(voteDbEntity);
        return {
            statusCode: 200,
            body: JSON.stringify(voteDto),
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
