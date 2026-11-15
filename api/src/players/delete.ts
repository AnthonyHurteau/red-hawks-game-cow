import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IPlayerDbEntity, PlayerDto } from "common/core/src/models/player";
import { deleteDocumentAsync, getDocumentBySortKeyAsync } from "common/core/src/services/dynamoDbClient";
import { IPlayer } from "common/models/player";
import { badRequest, serverError, isPlayerType } from "./validation";

const TABLE_NAME = process.env.TABLE_NAME;

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const id = event.pathParameters?.id;
    const type = event.queryStringParameters?.type;

    if (!id || !isPlayerType(type)) {
        return badRequest;
    }

    try {
        const player = await getDocumentBySortKeyAsync<IPlayerDbEntity>(type, id, TABLE_NAME);
        if (!player) {
            return {
                statusCode: 204,
                body: JSON.stringify({ message: "No Content" }),
            };
        }

        await deleteDocumentAsync<IPlayer>(new PlayerDto(player), TABLE_NAME);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Ok" }),
        };
    } catch (err) {
        console.error(err);
        return serverError;
    }
};
