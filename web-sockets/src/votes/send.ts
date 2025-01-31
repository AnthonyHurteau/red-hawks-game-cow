import { IItem } from "../../../common/core/src/models/item";
import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { postToConnectionAsync } from "common/core/src/services/apiGatewayClient";
import { deleteItemDocumentAsync, getItemDocumentsAsync } from "common/core/src/services/dynamoDbClient";
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

const TABLE_NAME = process.env.TABLE_NAME;

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    try {
        const vote = JSON.parse(event.body as string) as IVote;

        const connections = await getItemDocumentsAsync<IItem>(TABLE_NAME);

        if (connections && connections.length > 0) {
            const postCalls = connections.map(async (connection) => {
                try {
                    postToConnectionAsync(connection.pk, vote, event);

                    await Promise.all(postCalls);
                } catch (err: any) {
                    if (err.statusCode === 410) {
                        console.log(`Found stale connection, deleting ${connection.pk}`);
                        const item: IItem = { pk: connection.pk };
                        await deleteItemDocumentAsync<IItem>(item, TABLE_NAME);
                    } else {
                        console.error(err);
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
