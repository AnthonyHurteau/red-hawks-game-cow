import {
    ApiGatewayManagementApi,
    PostToConnectionCommand,
    PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { APIGatewayProxyEvent } from "aws-lambda";
import { IWsEntity } from "src/models/wsEntity";

export const postToConnectionAsync = async (
    connectionId: string,
    data: IWsEntity,
    wsEndpoint?: string,
    event?: APIGatewayProxyEvent,
): Promise<void> => {
    if (!event && !wsEndpoint) {
        throw new Error("Event or endpoint is required");
    }
    const endpoint = wsEndpoint ? wsEndpoint : `${event?.requestContext.domainName}/${event?.requestContext.stage}`;
    const apiGatewayClient = new ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint,
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
