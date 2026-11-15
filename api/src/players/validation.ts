import { PlayerType, Position } from "common/models/player";

export const isPlayerType = (type: unknown): type is PlayerType => {
    return typeof type === "string" && ["core", "sub"].includes(type);
};

export const isPosition = (position: unknown): position is Position => {
    return typeof position === "string" && ["F", "D", "G"].includes(position);
};

const isName = (name: unknown): name is string => {
    return typeof name === "string" && name.trim().length > 0 && name.trim().length <= 50;
};

export interface PlayerInput {
    firstName: string;
    lastName: string;
    position: Position;
}

/** Parses and validates the editable player fields from a request body. Returns null when invalid. */
export const parsePlayerInput = (body: unknown): PlayerInput | null => {
    if (!body || typeof body !== "object") return null;
    const { firstName, lastName, position } = body as Record<string, unknown>;
    if (!isName(firstName) || !isName(lastName) || !isPosition(position)) return null;
    return { firstName: firstName.trim(), lastName: lastName.trim(), position };
};

export const badRequest = {
    statusCode: 400,
    body: JSON.stringify({ message: "Bad Request" }),
};

export const serverError = {
    statusCode: 500,
    body: JSON.stringify({ message: "Internal Server Error" }),
};

/** JSON.parse that returns undefined instead of throwing on a malformed body. */
export const parseBody = (body: string | undefined): unknown => {
    try {
        return JSON.parse(body ?? "");
    } catch {
        return undefined;
    }
};
