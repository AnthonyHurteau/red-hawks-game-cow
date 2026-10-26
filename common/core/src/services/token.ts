import { createHash, createHmac, timingSafeEqual } from "crypto";
import { UserType } from "common/models/user";
import { getSecretAsync } from "./secrets";

// Signed, expiring session tokens (JWT, HS256). Users never type anything:
// the API hands one out when it creates the user, and the app stores it.

export const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface TokenClaims {
    sub: string;
    typ: UserType;
    iat: number;
    exp: number;
}

const base64url = (input: Buffer | string) => Buffer.from(input).toString("base64url");
const HEADER = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));

const sign = (data: string, key: string) => createHmac("sha256", key).update(data).digest();

const getKeyAsync = () => getSecretAsync(process.env.TOKEN_SECRET_PARAM);

export const issueTokenAsync = async (userId: string, type: UserType, now = Date.now()): Promise<string> => {
    const iat = Math.floor(now / 1000);
    const claims: TokenClaims = { sub: userId, typ: type, iat, exp: iat + TOKEN_TTL_SECONDS };
    const payload = base64url(JSON.stringify(claims));
    const signature = base64url(sign(`${HEADER}.${payload}`, await getKeyAsync()));
    return `${HEADER}.${payload}.${signature}`;
};

export const verifyToken = (token: string, key: string, now = Date.now()): TokenClaims | null => {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== HEADER) {
        return null;
    }

    const expected = sign(`${parts[0]}.${parts[1]}`, key);
    const actual = Buffer.from(parts[2], "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        return null;
    }

    try {
        const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as TokenClaims;
        if (typeof claims.sub !== "string" || (claims.typ !== "user" && claims.typ !== "admin")) {
            return null;
        }
        if (typeof claims.exp !== "number" || claims.exp <= Math.floor(now / 1000)) {
            return null;
        }
        return claims;
    } catch {
        return null;
    }
};

export const verifyTokenAsync = async (token: string): Promise<TokenClaims | null> =>
    verifyToken(token, await getKeyAsync());

// Constant-time comparison that doesn't leak the secret's length.
export const safeEqual = (a: string, b: string) =>
    timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export const bearerToken = (header: string | undefined): string | undefined => {
    if (!header) return undefined;
    const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
    return match ? match[1] : undefined;
};
