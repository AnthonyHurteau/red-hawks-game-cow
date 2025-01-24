type serviceTypes = "get" | "getList" | "create" | "update" | "delete";
type voteServiceTypes = serviceTypes | "mock";

export const sourceDir = "src";

const playersDir = `${sourceDir}/players`;
const playersServices: serviceTypes[] = ["get"];
const players = playersServices.map((service) => `${playersDir}/${service}.ts`);

const gamesDir = `${sourceDir}/games`;
const gamesServices: serviceTypes[] = ["create", "update", "get"];
const games = gamesServices.map((service) => `${gamesDir}/${service}.ts`);

const usersDir = `${sourceDir}/users`;
const usersServices: serviceTypes[] = ["get", "create", "update", "delete"];
const users = usersServices.map((service) => `${usersDir}/${service}.ts`);

const votesDir = `${sourceDir}/votes`;
const votesServices: voteServiceTypes[] = ["get", "getList", "create", "update", "delete", "mock"];
const votes = votesServices.map((service) => `${votesDir}/${service}.ts`);

const authDir = `${sourceDir}/auth`;
const authServices: string[] = ["auth"];
const auth = authServices.map((service) => `${authDir}/${service}.ts`);

export const buildFiles = [players, games, votes, users, auth].flat();
