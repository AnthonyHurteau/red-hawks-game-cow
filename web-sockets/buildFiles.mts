type ServiceTypes = "send" | "connectHandler" | "disconnectHandler";

export const sourceDir = "src";

const serviceConfigurations: { dir: string; services: ServiceTypes[] }[] = [
    { dir: "handlers", services: ["connectHandler", "disconnectHandler"] },
    { dir: "games", services: ["send"] },
    { dir: "votes", services: ["send"] },
];

const generateServicePaths = (dir: string, services: ServiceTypes[]): string[] => {
    return services.map((service) => `${sourceDir}/${dir}/${service}.ts`);
};

const buildFiles = serviceConfigurations.map(({ dir, services }) => generateServicePaths(dir, services)).flat();

export default buildFiles;
