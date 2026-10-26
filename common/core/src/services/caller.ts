import { APIGatewayProxyEventV2 } from "aws-lambda";
import { UserType } from "common/models/user";

export interface Caller {
    userId: string;
    userType: UserType;
}

// Identity set by the Lambda authorizer. Never trust ids from the body or path instead.
export const getCaller = (event: APIGatewayProxyEventV2): Caller | undefined => {
    const context = (event.requestContext as { authorizer?: { lambda?: Record<string, unknown> } }).authorizer
        ?.lambda;
    const userId = context?.userId;
    const userType = context?.userType;
    if (typeof userId === "string" && (userType === "user" || userType === "admin")) {
        return { userId, userType };
    }
    return undefined;
};

export const response = (statusCode: number, body: unknown) => ({
    statusCode,
    body: typeof body === "string" ? body : JSON.stringify(body),
});

export const unauthorized = () => response(403, { message: "Forbidden" });
export const badRequest = () => response(400, { message: "Bad Request" });
