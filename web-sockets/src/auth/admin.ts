import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { authorizeAsync } from "common/core/src/services/authorizer";

const TABLE_NAME = process.env.TABLE_NAME;

// WebSocket $connect authorizer: browsers can't set headers, so the token comes as ?token=.
export const lambdaHandler = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    return authorizeAsync(event.queryStringParameters?.token, "admin", event.methodArn, TABLE_NAME);
};
