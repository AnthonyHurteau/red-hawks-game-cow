import {
    ApiGatewayManagementApi,
    GoneException,
    PostToConnectionCommand,
    PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { APIGatewayProxyEvent } from "aws-lambda";
import { IBaseEntity } from "common/models/baseEntity";
import { IWsEntity } from "src/models/wsEntity";

export const postToConnectionAsync = async (
    connectionId: string,
    data: IWsEntity<IBaseEntity>,
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

    await apiGatewayClient.send(command);
};

/** True when API Gateway reports the websocket connection no longer exists (HTTP 410). */
export const isGoneConnectionError = (error: unknown): boolean => {
    return (
        error instanceof GoneException ||
        (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode === 410
    );
};
