import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({});
const cache = new Map<string, Promise<string>>();

// Reads an SSM SecureString once per Lambda container and caches it.
export const getSecretAsync = (parameterName: string | undefined): Promise<string> => {
    if (!parameterName) {
        return Promise.reject(new Error("Secret parameter name is not configured"));
    }

    let value = cache.get(parameterName);
    if (!value) {
        value = ssmClient
            .send(new GetParameterCommand({ Name: parameterName, WithDecryption: true }))
            .then((result) => {
                const secret = result.Parameter?.Value;
                if (!secret) {
                    throw new Error(`Secret parameter ${parameterName} is empty`);
                }
                return secret;
            });
        // Don't cache a failure, so the next call retries.
        value.catch(() => cache.delete(parameterName));
        cache.set(parameterName, value);
    }
    return value;
};
