import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { UserDbEntity, UserDto, IUserDbEntity } from "common/core/src/models/user";
import { User } from "common/models/user";
import { ISession } from "common/models/session";
import { timeToLive } from "common/core/src/services/timeToLiveHelper";
import { createDocumentAsync } from "common/core/src/services/dynamoDbClient";
import { issueTokenAsync } from "common/core/src/services/token";
import { badRequest, response } from "common/core/src/services/caller";

const TABLE_NAME = process.env.TABLE_NAME as string;

// Unauthenticated: creates a new anonymous user. The id is always generated
// here; anything the client sends for id or type is ignored.
export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const body = JSON.parse(event.body || "{}") as Partial<User>;
        const user = new User({
            id: "",
            type: "user",
            userAgent: typeof body.userAgent === "string" ? body.userAgent : "",
            lastLogin: new Date().toISOString(),
        });

        const userDbEntity = new UserDbEntity(user, timeToLive(6, "months"));
        await createDocumentAsync<IUserDbEntity>(userDbEntity, TABLE_NAME);

        const userDto = new UserDto(userDbEntity);
        const session: ISession = { user: userDto, token: await issueTokenAsync(userDto.id, "user") };
        return response(200, session);
    } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        return badRequest();
    }
};
