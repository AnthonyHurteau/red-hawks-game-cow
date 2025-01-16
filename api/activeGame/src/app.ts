import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "../../common/services/dynamoDbClient";
import { HttpVerbs } from "../../common/enums/httpVerbs";
import { ActiveGame } from "../../../common/models/game";
import { Player } from "../../../common/models/player";
import { Vote } from "../../../common/models/vote";

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
    if (event.httpMethod === HttpVerbs.GET) {
        try {
            const result = await dynamoDbClient.getDocumentsAsync<ActiveGame>("ActiveGame");

            if (result && result.length > 0) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(result[0]),
                };
            } else {
                return {
                    statusCode: 204,
                    body: "",
                };
            }
        } catch (err) {
            console.error(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error fetching active game",
                }),
            };
        }
    } else if (event.httpMethod === HttpVerbs.POST) {
        try {
            const previousActiveGames = await dynamoDbClient.getDocumentsAsync<ActiveGame>("ActiveGame");

            if (previousActiveGames) {
                for (const previousActiveGame of previousActiveGames) {
                    if (previousActiveGame.isVoteComplete) {
                        await dynamoDbClient.deleteDocumentAsync("ActiveGame", previousActiveGame.id);
                    } else {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: "There is an active vote in progress",
                            }),
                        };
                    }
                }
            }

            const activeGame = JSON.parse(event.body as string) as ActiveGame;
            const corePlayers = await dynamoDbClient.getDocumentsAsync<Player>("Player");

            if (!corePlayers) {
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Error fetching core players",
                    }),
                };
            }
            activeGame.players = corePlayers;

            const result = await dynamoDbClient.createDocumentAsync<ActiveGame>("ActiveGame", activeGame);

            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (err) {
            console.error(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error creating active game",
                }),
            };
        }
    } else if (event.httpMethod === HttpVerbs.PUT) {
        try {
            const activeGame = JSON.parse(event.body as string) as ActiveGame;

            if (activeGame.isVoteComplete) {
                const votes = await dynamoDbClient.getDocumentsAsync<Vote>("Vote");
                if (votes) {
                    activeGame.votes = votes;
                }
            } else if (!activeGame.isVoteComplete) {
                activeGame.votes = [];
            }

            const result = await dynamoDbClient.updateDocumentAsync<ActiveGame>(
                "ActiveGame",
                activeGame.id,
                activeGame,
            );

            return {
                statusCode: 200,
                body: JSON.stringify(result),
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
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({
                message: "Method not allowed",
            }),
        };
    }
};
