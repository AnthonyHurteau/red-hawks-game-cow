type ServiceTypes = "get" | "getList" | "create" | "update" | "delete" | "mock" | "deleteAll" | "admin" | "user";

export const sourceDir = "src";

const serviceConfigurations: { dir: string; services: ServiceTypes[] }[] = [
    { dir: "players", services: ["get"] },
    { dir: "games", services: ["create", "update", "get", "delete"] },
    { dir: "users", services: ["get", "create", "update", "delete"] },
    { dir: "votes", services: ["get", "getList", "create", "update", "delete", "mock", "deleteAll"] },
    { dir: "auth", services: ["admin", "user"] },
];

const generateServicePaths = (dir: string, services: ServiceTypes[]): string[] => {
    return services.map((service) => `${sourceDir}/${dir}/${service}.ts`);
};

const buildFiles = serviceConfigurations.map(({ dir, services }) => generateServicePaths(dir, services)).flat();

export default buildFiles;
