import esbuild, { BuildOptions } from "esbuild";
import path from "path";
import fs from "fs";

const buildOptions: BuildOptions = {
    bundle: true,
    platform: "node",
    target: "node20",
    sourcemap: true,
    minify: true,
};

const build = async (watch: boolean, sourceDir: string, entryPointImport: string) => {
    try {
        const entryPointPath = path.resolve(process.cwd(), entryPointImport);
        console.log(`Importing entry points from: ${entryPointPath}`);
        const entryPointsModule = await import(entryPointPath);
        const entryPoints = entryPointsModule.default;
        console.log(`Entry points: ${JSON.stringify(entryPoints)}`);
        const contexts: any[] = [];
        for (const entryPoint of entryPoints) {
            const relativePath = path.relative(sourceDir, entryPoint);
            const outfile = path.join("dist", relativePath).replace(".ts", ".js");

            const outDir = `./${path.dirname(outfile)}`;
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            if (watch) {
                const context = await esbuild.context({
                    ...buildOptions,
                    entryPoints: [entryPoint],
                    outfile: outfile,
                    logLevel: "info",
                });
                await context.watch();
                contexts.push(context);
            } else {
                await esbuild.build({
                    ...buildOptions,
                    entryPoints: [entryPoint],
                    outfile: outfile,
                });
            }
        }
        console.log("Build successful");

        if (watch) {
            process.on("SIGINT", () => {
                console.log("Stopping watch mode...");
                contexts.forEach((context) => context.dispose());
                process.exit(0);
            });
        }
    } catch (err) {
        console.error("Build failed", err);
        process.exit(1);
    }
};

const watch = process.argv.includes("--watch");
const args = process.argv.slice(2);
const entryPointImportIndex = args.indexOf("--entryPointImport");
const sourceDirIndex = args.indexOf("--sourceDir");

if (entryPointImportIndex === -1 || sourceDirIndex === -1) {
    console.error("Missing required arguments: --entryPointImport and --sourceDir");
    process.exit(1);
}

const entryPointimport = args[entryPointImportIndex + 1];
const sourceDir = args[sourceDirIndex + 1];

build(watch, sourceDir, entryPointimport);
