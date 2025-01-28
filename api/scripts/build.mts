import esbuild, { BuildOptions } from "esbuild";
import path from "path";
import fs from "fs";
import buildFiles, { sourceDir } from "../buildFiles.mjs";

const entryPoints = buildFiles;

const buildOptions: BuildOptions = {
    bundle: true,
    platform: "node",
    target: "node20",
    sourcemap: true,
    minify: true,
};

const build = async (watch: boolean) => {
    try {
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
build(watch);
