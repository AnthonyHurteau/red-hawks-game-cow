import { Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { BaseProps } from "../types/base-props";

// SSM SecureString parameters. CloudFormation can't create SecureStrings, so a
// human creates them once per environment (see the PR description), and they
// cost nothing on the standard tier.
export type SecretName = "token-secret" | "admin-password";

export const secretParameterName = (baseProps: BaseProps, secret: SecretName) =>
  `/${baseProps.product}/${baseProps.environment}/${secret}`;

const ENV_VAR: Record<SecretName, string> = {
  "token-secret": "TOKEN_SECRET_PARAM",
  "admin-password": "ADMIN_PASSWORD_PARAM",
};

// Gives a function read access to the named secrets and tells it where they are.
export const grantSecrets = (
  fn: IFunction & { addEnvironment(key: string, value: string): unknown },
  baseProps: BaseProps,
  secrets: SecretName[]
) => {
  const stack = Stack.of(fn);
  secrets.forEach((secret) => {
    const parameterName = secretParameterName(baseProps, secret);
    fn.addEnvironment(ENV_VAR[secret], parameterName);
    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [
          stack.formatArn({
            service: "ssm",
            resource: "parameter",
            resourceName: parameterName.slice(1),
          }),
        ],
      })
    );
  });
};
