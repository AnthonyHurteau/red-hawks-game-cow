import { APIGatewayProxyEvent } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
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
        const params = {
            ConnectionId: connectionId,
            Data: data,
        };

        try {
            await this.apiGatewayClient.postToConnection(params).promise();
        } catch (error) {
            console.error(error);
        }
    }
}
