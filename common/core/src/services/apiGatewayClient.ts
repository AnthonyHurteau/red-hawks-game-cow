import {
    ApiGatewayManagementApi,
    PostToConnectionCommand,
    PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { APIGatewayProxyEvent } from "aws-lambda";
import { IBaseEntity } from "common/models/baseEntity";

export const postToConnectionAsync = async <T extends IBaseEntity>(
    connectionId: string,
    data: T,
    event: APIGatewayProxyEvent,
): Promise<void> => {
    const apiGatewayClient = new ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    const params: PostToConnectionCommandInput = {
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(data)),
    };
    const command = new PostToConnectionCommand(params);

    try {
        await apiGatewayClient.send(command);
    } catch (error) {
        console.error(error);
    }
};
