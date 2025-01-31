import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { updateDocumentAsync } from "common/core/src/services/dynamoDbClient";
import { IVote, Vote } from "common/models/vote";

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
        const body = JSON.parse(event.body as string) as IVote;
        const vote = new Vote(body);
        await updateDocumentAsync<IVote>(vote, TABLE_NAME);

        return {
            statusCode: 200,
            body: JSON.stringify(vote),
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
