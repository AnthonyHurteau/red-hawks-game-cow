import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { IGame } from "common/models/game";
import { getAsync } from "/opt/nodejs/core/src/services/httpHelper";
import { IVote } from "common/models/vote";

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
        const game = JSON.parse(event.body as string) as IGame;

        if (game.isVoteComplete) {
            const result = await getAsync(process.env.GET_VOTES_ENDPOINT);
            const votes = (await result.json()) as IVote[];
            if (votes) {
                game.votes = votes;
            }
        } else if (!game.isVoteComplete) {
            game.votes = [];
        }

        await dynamoDbClient.updateDocumentAsync<IGame>(game);

        return {
            statusCode: 200,
            body: "Ok",
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error updating active game",
            }),
        };
    }
};
