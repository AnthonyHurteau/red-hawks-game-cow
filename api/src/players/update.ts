import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IPlayerDbEntity, PlayerDto } from "common/core/src/models/player";
import { createDocumentAsync, getDocumentBySortKeyAsync } from "common/core/src/services/dynamoDbClient";
import { badRequest, parseBody, serverError, isPlayerType, parsePlayerInput } from "./validation";

const TABLE_NAME = process.env.TABLE_NAME;

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const body = parseBody(event.body) as Record<string, unknown> | undefined;
        const input = parsePlayerInput(body);
        const id = body?.id;
        const type = body?.type;

        if (!input || typeof id !== "string" || !isPlayerType(type)) {
            return badRequest;
        }

        const existing = await getDocumentBySortKeyAsync<IPlayerDbEntity>(type, id, TABLE_NAME);
        if (!existing) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Not Found" }),
            };
        }

        // Only the editable fields change; pk/sk/created are kept from the stored item.
        const updated: IPlayerDbEntity = {
            ...existing,
            ...input,
            modified: new Date().toISOString(),
        };
        await createDocumentAsync<IPlayerDbEntity>(updated, TABLE_NAME);

        return {
            statusCode: 200,
            body: JSON.stringify(new PlayerDto(updated)),
        };
    } catch (err) {
        console.error(err);
        return serverError;
    }
};
