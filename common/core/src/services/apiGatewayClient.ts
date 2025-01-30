import {
    ApiGatewayManagementApi,
    PostToConnectionCommand,
    PostToConnectionCommandInput,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { APIGatewayProxyEvent } from "aws-lambda";
import { IBaseEntity } from "common/models/baseEntity";

export class ApiGatewayClient {
    private readonly apiGatewayClient: ApiGatewayManagementApi;

    constructor(event: APIGatewayProxyEvent) {
        if (!event) {
            throw new Error("Event cannot be null or undefined.");
        }

        this.apiGatewayClient = new ApiGatewayManagementApi({
            apiVersion: "2018-11-29",
            endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
        });
    }

    async postToConnectionAsync<T extends IBaseEntity>(connectionId: string, data: T): Promise<void> {
        const params: PostToConnectionCommandInput = {
            ConnectionId: connectionId,
            Data: Buffer.from(JSON.stringify(data)),
        };
        const command = new PostToConnectionCommand(params);

        try {
            await this.apiGatewayClient.send(command);
        } catch (error) {
            console.error(error);
        }
    }
}
