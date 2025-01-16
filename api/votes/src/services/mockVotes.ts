import { Vote, VoteInit } from "../../../../common/models/vote";
import { ActiveGame } from "../../../../common/models/game";
import { DynamoDbClient } from "../../../common/services/dynamoDbClient";

export const createMockVotesAsync = async (dynamoDbClient: DynamoDbClient, numberOfVotes: number) => {
    const activeGame = await dynamoDbClient.getDocumentsAsync<ActiveGame>("ActiveGame");
    if (activeGame) {
        const votes = await generateMockVotesAsync(numberOfVotes, activeGame[0]);
        if (votes) {
            const existingVotes = await dynamoDbClient.getDocumentsAsync<Vote>("Vote");
            if (existingVotes && existingVotes.length > 0) {
                const existingVoteIds = existingVotes.map((vote) => vote.id);
                await dynamoDbClient.deleteDocumentsAsync("Vote", existingVoteIds);
            }
            await dynamoDbClient.createDocumentsAsync<Vote>("Vote", votes);
        }
    }
};

const generateMockVotesAsync = async (numberOfVotes: number, activeGame: ActiveGame) => {
    const players = activeGame.players;
    const votes: Vote[] = [];

    if (!players) {
        return;
    }

    for (let i = 0; i < numberOfVotes; i++) {
        const randomPlayerIndex = Math.floor(Math.random() * players.length);
        const newVote: Vote = {
            ...new VoteInit(),
            userId: `mock-vote-${i}`,
            playerId: players[randomPlayerIndex].id,
        };
        votes.push(newVote);
    }

    return votes;
};
