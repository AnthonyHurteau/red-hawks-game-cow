import { APIGatewayAuthorizerResult } from "aws-lambda";
import { UserType } from "common/models/user";
import { IDbEntity } from "../models/dbEntity";
import { buildPolicy } from "./authPolicyHelper";
import { getDocumentBySortKeyAsync } from "./dynamoDbClient";
import { verifyTokenAsync } from "./token";

const deny = (resourceArn: string, reason: string): APIGatewayAuthorizerResult => {
    // Log why, never the token itself.
    console.warn(`Authorization denied: ${reason}`);
    return buildPolicy(resourceArn, "UnauthorizedUser", "Deny");
};

/**
 * Checks a session token and returns an Allow policy with the caller's
 * identity in the context, or a Deny policy on any failure or error.
 */
export const authorizeAsync = async (
    token: string | undefined,
    required: UserType,
    resourceArn: string,
    tableName: string | undefined,
): Promise<APIGatewayAuthorizerResult> => {
    try {
        if (!token) {
            return deny(resourceArn, "missing token");
        }

        const claims = await verifyTokenAsync(token);
        if (!claims) {
            return deny(resourceArn, "invalid or expired token");
        }
        if (required === "admin" && claims.typ !== "admin") {
            return deny(resourceArn, "admin required");
        }

        // The user must still exist with that type, so deleting a user revokes access.
        const user = await getDocumentBySortKeyAsync<IDbEntity>(claims.sub, claims.typ, tableName as string);
        if (!user) {
            return deny(resourceArn, "user no longer exists");
        }

        return {
            ...buildPolicy(resourceArn, claims.sub, "Allow"),
            context: { userId: claims.sub, userType: claims.typ },
        };
    } catch (err) {
        console.error("Authorizer error", err instanceof Error ? err.message : err);
        return deny(resourceArn, "error");
    }
};
