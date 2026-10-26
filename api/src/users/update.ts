import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getDocumentBySortKeyAsync, updateDocumentAsync } from "common/core/src/services/dynamoDbClient";
import { IUserDbEntity, UserDto } from "common/core/src/models/user";
import { User } from "common/models/user";
import { badRequest, getCaller, response, unauthorized } from "common/core/src/services/caller";

const TABLE_NAME = process.env.TABLE_NAME as string;

// Authenticated (user): updates the caller's own record. id and type come from
// the token, never from the body.
export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const caller = getCaller(event);
    if (!caller) return unauthorized();

    try {
        const body = JSON.parse(event.body || "{}") as Partial<User>;
        const user = new User({
            id: caller.userId,
            type: caller.userType,
            userAgent: typeof body.userAgent === "string" ? body.userAgent : "",
            lastLogin: new Date().toISOString(),
        });
        await updateDocumentAsync(user, TABLE_NAME);

        const saved = await getDocumentBySortKeyAsync<IUserDbEntity>(caller.userId, caller.userType, TABLE_NAME);
        return saved ? response(200, new UserDto(saved)) : badRequest();
    } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        return badRequest();
    }
};
