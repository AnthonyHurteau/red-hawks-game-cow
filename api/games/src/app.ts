import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "../../common/services/dynamoDbClient";
import { HttpVerbs } from "../../common/enums/httpVerbs";
import { ActiveGame, Game } from "../../../common/models/game";
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
            const result = await dynamoDbClient.getDocumentsAsync<Game>("Game");

            if (result && result.length > 0) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(result),
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
            const game = JSON.parse(event.body as string) as Game;

            if (game.votes.length === 0) {
                return {
                    statusCode: 400,
                    body: "No votes cast",
                };
            }

            const result = await dynamoDbClient.createDocumentAsync<Game>("Game", game);

            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (err) {
            console.error(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error creating game",
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
