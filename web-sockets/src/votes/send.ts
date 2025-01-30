import { IItem } from "../../../common/core/src/models/item";
import { DynamoDbClient } from "common/core/src/services/dynamoDbClient";
import { ApiGatewayClient } from "common/core/src/services/apiGatewayClient";
import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { IVote } from "common/models/vote";
import { AWSError } from "../../../common/core/node_modules/aws-sdk";

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

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    try {
        const vote = JSON.parse(event.body as string) as IVote;
        const apiGatewayClient = new ApiGatewayClient(event);

        const connections = await dynamoDbClient.getItemDocumentsAsync<IItem>();

        if (connections && connections.length > 0) {
            const postCalls = connections.map(async (connection) => {
                try {
                    apiGatewayClient.postToConnectionAsync(connection.pk, vote);

                    await Promise.all(postCalls);
                } catch (err) {
                    const error = err as AWSError;
                    if (error.statusCode === 410) {
                        console.log(`Found stale connection, deleting ${connection.pk}`);
                        const item: IItem = { pk: connection.pk };
                        await dynamoDbClient.deleteItemDocumentAsync<IItem>(item);
                    } else {
                        console.error(error);
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: "Bad Request",
                            }),
                        };
                    }
                }
            });
        }
    } catch (err) {
        console.error(err);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Bad Request",
            }),
        };
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad Request",
        }),
    };
};
