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

// Longest userAgent we store. Real browser user agents are well under this.
export const MAX_USER_AGENT_LENGTH = 512;

// Returns the userAgent from a request body, "" if missing, or undefined if too long.
export const readUserAgent = (value: unknown): string | undefined => {
    if (typeof value !== "string") return "";
    return value.length <= MAX_USER_AGENT_LENGTH ? value : undefined;
};
