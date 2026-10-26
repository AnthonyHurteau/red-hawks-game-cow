import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { UserDbEntity, UserDto, IUserDbEntity } from "common/core/src/models/user";
import { User } from "common/models/user";
import { ISession } from "common/models/session";
import { timeToLive } from "common/core/src/services/timeToLiveHelper";
import { createDocumentAsync, deleteDocumentAsync } from "common/core/src/services/dynamoDbClient";
import { getSecretAsync } from "common/core/src/services/secrets";
import { issueTokenAsync, safeEqual } from "common/core/src/services/token";
import { badRequest, getCaller, response, unauthorized } from "common/core/src/services/caller";

const TABLE_NAME = process.env.TABLE_NAME as string;

// Authenticated (user): promotes the caller, and only the caller, to admin.
export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const caller = getCaller(event);
    if (!caller) {
        return unauthorized();
    }

    try {
        const { password } = JSON.parse(event.body || "{}") as { password?: unknown };
        if (typeof password !== "string" || password.length === 0) {
            return badRequest();
        }

        const adminPassword = await getSecretAsync(process.env.ADMIN_PASSWORD_PARAM);
        if (!safeEqual(password, adminPassword)) {
            console.warn("Admin elevation refused: wrong password");
            return unauthorized();
        }

        // The user type is the sort key, so moving to admin means delete + create.
        if (caller.userType === "user") {
            await deleteDocumentAsync(new User({ id: caller.userId, type: "user" }), TABLE_NAME);
        }
        const admin = new User({ id: caller.userId, type: "admin" });
        const userDbEntity = new UserDbEntity(admin, timeToLive(6, "months"));
        await createDocumentAsync<IUserDbEntity>(userDbEntity, TABLE_NAME);

        const userDto = new UserDto(userDbEntity);
        const session: ISession = { user: userDto, token: await issueTokenAsync(userDto.id, "admin") };
        return response(200, session);
    } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        return badRequest();
    }
};
