import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbClient } from "../../common/services/dynamoDbClient";
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
    if (event.httpMethod === "GET") {
        if (event.queryStringParameters) {
            try {
                const userId = event.queryStringParameters.userId;
                const result = await dynamoDbClient.getDocumentsAsync<Vote>("Vote", event.queryStringParameters);
                return {
                    statusCode: 200,
                    body: result ? JSON.stringify(result) : JSON.stringify([]),
                };
            } catch (err) {
                console.error(err);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Error fetching vote",
                    }),
                };
            }
        } else {
            try {
                const result = await dynamoDbClient.getDocumentsAsync<Vote>("Vote");
                return {
                    statusCode: 200,
                    body: result ? JSON.stringify(result) : JSON.stringify([]),
                };
            } catch (err) {
                console.error(err);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Error fetching votes",
                    }),
                };
            }
        }
    } else if (event.httpMethod === "POST") {
        try {
            const vote = JSON.parse(event.body as string) as Vote;
            const result = await dynamoDbClient.createDocumentAsync<Vote>("Vote", vote);
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (err) {
            console.error(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error creating vote",
                }),
            };
        }
    } else if (event.httpMethod === "PUT") {
        try {
            const vote = JSON.parse(event.body as string) as Vote;
            const result = await dynamoDbClient.updateDocumentAsync<Vote>("Vote", vote.id, vote);
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (err) {
            console.error(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error updating vote",
                }),
            };
        }
    } else if (event.httpMethod === "DELETE") {
        try {
            const vote = JSON.parse(event.body as string) as Vote;
            await dynamoDbClient.deleteDocumentAsync("Vote", vote.id);
            return {
                statusCode: 200,
                body: JSON.stringify({}),
            };
        } catch (err) {
            console.error(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error deleting vote",
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
