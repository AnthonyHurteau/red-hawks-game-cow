import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "/opt/nodejs/core/src/services/dynamoDbClient";
import { IVote, Vote } from "common/models/vote";
import { IVoteDbEntity, VoteDbEntity, VoteDto } from "/opt/nodejs/core/src/models/vote";
import { IPlayer } from "common/models/player";
import { deleteAsync } from "/opt/nodejs/core/src/services/httpHelper";

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
        const players = JSON.parse(event.body as string) as IPlayer[];
        const numberOfVotes = parseInt(process.env.NUMBER_OF_VOTES);
        const votes = await generateMockVotesAsync(numberOfVotes, players);
        const voteDbEntities = votes.map((vote) => new VoteDbEntity(vote));
        await dynamoDbClient.createDocumentsAsync<IVoteDbEntity>(voteDbEntities);

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
