import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IPlayerDbEntity, PlayerDbEntity, PlayerDto } from "common/core/src/models/player";
import { createDocumentAsync } from "common/core/src/services/dynamoDbClient";
import { Player } from "common/models/player";
import { badRequest, parseBody, serverError, isPlayerType, parsePlayerInput } from "./validation";

const TABLE_NAME = process.env.TABLE_NAME;

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const body = parseBody(event.body) as Record<string, unknown> | undefined;
        const input = parsePlayerInput(body);
        const type = body?.type ?? "core";

        if (!input || !isPlayerType(type)) {
            return badRequest;
        }

        const playerDbEntity = new PlayerDbEntity(new Player({ ...input, type }));
        await createDocumentAsync<IPlayerDbEntity>(playerDbEntity, TABLE_NAME);

        return {
            statusCode: 200,
            body: JSON.stringify(new PlayerDto(playerDbEntity)),
        };
    } catch (err) {
        console.error(err);
        return serverError;
    }
};
