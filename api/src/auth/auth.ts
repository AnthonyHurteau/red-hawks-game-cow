import {
    APIGatewayAuthorizerCallback,
    APIGatewayAuthorizerResult,
    APIGatewayRequestAuthorizerEventV2,
    Context,
    StatementEffect,
} from "aws-lambda";
import { IUserDbEntity, UserDto } from "common/core/src/models/user";
import { getDocumentsByPrimaryKeyAsync } from "common/core/src/services/dynamoDbClient";
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const TABLE_NAME = process.env.TABLE_NAME;

export const lambdaHandler = async (
    event: APIGatewayRequestAuthorizerEventV2,
    context: Context,
    callback: APIGatewayAuthorizerCallback,
) => {
    const authHeader = event.headers?.Authorization;

    if (authHeader) {
        const userId = authHeader;
        const result = await getDocumentsByPrimaryKeyAsync<IUserDbEntity>(userId, TABLE_NAME);

        if (result && result.length > 0) {
            const userDto = new UserDto(result[0]);
            if (userDto.type === "admin") {
                const policy = buildAllowAllPolicy(event, userId);
                console.log(JSON.stringify(policy));
                callback(null, policy);
            }
        }
    }

    callback("Unauthorized");
};

const buildAllowAllPolicy = (
    event: APIGatewayRequestAuthorizerEventV2,
    principalId: string,
): APIGatewayAuthorizerResult => {
    const authResponse: APIGatewayAuthorizerResult = {
        principalId: principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: "Allow" as StatementEffect,
                    Resource: [event.routeArn],
                },
            ],
        },
    };

    return authResponse;
};
