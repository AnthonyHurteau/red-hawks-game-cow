import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "../../common/services/dynamoDbClient";
import { HttpVerbs } from "../../common/enums/httpVerbs";
import { ActiveGame } from "../../../common/models/game";
import { Player } from "../../../common/models/player";

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

            if (result) {
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
                    await dynamoDbClient.deleteDocumentAsync("ActiveGame", previousActiveGame.id);
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

            const result = await dynamoDbClient.createDocumentAsync<ActiveGame>(activeGame);

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
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({
                message: "Method not allowed",
            }),
        };
    }
};
