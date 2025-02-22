import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IVote, Vote } from "common/models/vote";
import { IVoteDbEntity, VoteDbEntity } from "common/core/src/models/vote";
import { IPlayer } from "common/models/player";
import { createDocumentsAsync } from "common/core/src/services/dynamoDbClient";

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
        const players = JSON.parse(event.body as string) as IPlayer[];
        const numberOfVotes = parseInt(process.env.NUMBER_OF_VOTES);
        const votes = await generateMockVotesAsync(numberOfVotes, players);
        const voteDbEntities = votes.map((vote) => new VoteDbEntity(vote));
        await createDocumentsAsync<IVoteDbEntity>(voteDbEntities, TABLE_NAME);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Ok",
            }),
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

const generateMockVotesAsync = async (numberOfVotes: number, players: IPlayer[]) => {
    const votes: IVote[] = [];

    for (let i = 0; i < numberOfVotes; i++) {
        const randomPlayerIndex = Math.floor(Math.random() * players.length);
        const userId = `mock-vote-${i}`;
        const playerId = players[randomPlayerIndex].id;
        const newVote: IVote = new Vote({ userId, playerId });
        votes.push(newVote);
    }

    return votes;
};
