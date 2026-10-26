import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { authorizeAsync } from "common/core/src/services/authorizer";
import { bearerToken } from "common/core/src/services/token";

const TABLE_NAME = process.env.TABLE_NAME;

// HTTP API authorizer: expects "Authorization: Bearer <token>".
export const lambdaHandler = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    const token = bearerToken(event.headers?.authorization || event.headers?.Authorization);
    return authorizeAsync(token, "admin", event.methodArn, TABLE_NAME);
};
