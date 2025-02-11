import { APIGatewayAuthorizerResult, StatementEffect } from "aws-lambda";

export const buildPolicy = (
    resourceArn: string,
    principalId: string,
    effect: StatementEffect,
): APIGatewayAuthorizerResult => {
    const authResponse: APIGatewayAuthorizerResult = {
        principalId: principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: [resourceArn],
                },
            ],
        },
    };

    return authResponse;
};
