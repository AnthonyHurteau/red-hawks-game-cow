import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { IUserDbEntity, UserDto } from "common/core/src/models/user";
import { getDocumentsByPrimaryKeyAsync } from "common/core/src/services/dynamoDbClient";
import { badRequest, getCaller, response, unauthorized } from "common/core/src/services/caller";

const TABLE_NAME = process.env.TABLE_NAME as string;

// Authenticated (user): a user may read only themselves; admins may read anyone.
export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const caller = getCaller(event);
    const id = event.pathParameters?.id;
    if (!caller) return unauthorized();
    if (!id) return badRequest();
    if (id !== caller.userId && caller.userType !== "admin") return unauthorized();

    try {
        const result = await getDocumentsByPrimaryKeyAsync<IUserDbEntity>(id, TABLE_NAME);
        if (result && result.length > 0) {
            return response(200, new UserDto(result[0]));
        }
        return response(204, "No content");
    } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        return badRequest();
    }
};
