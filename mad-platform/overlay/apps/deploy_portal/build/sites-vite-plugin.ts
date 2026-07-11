import { access, cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

// Packages Sites metadata and migrations after Vite finishes compiling.
export function sites(): Plugin {
  let root = process.cwd();

  return {
    name: "sites",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const outputDirectory = resolve(root, "dist", ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const drizzleSource = resolve(root, "drizzle");
      const serverDirectory = resolve(root, "dist", "server");
      const serverAssetsDirectory = resolve(serverDirectory, "assets");
      const rscAssetsManifest = resolve(serverDirectory, "__vite_rsc_assets_manifest.js");

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });

      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }
      if (await exists(drizzleSource)) {
        await cp(drizzleSource, resolve(outputDirectory, "drizzle"), {
          recursive: true,
        });
      }

      if ((await exists(serverDirectory)) && !(await exists(rscAssetsManifest))) {
        const cssAssets = (await exists(serverAssetsDirectory))
          ? (await readdir(serverAssetsDirectory)).filter((file) => file.endsWith(".css"))
          : [];

        const manifestSource = `const manifest = ${JSON.stringify(
          {
            clientReferenceDeps: {},
            serverResources: {
              "app/layout.tsx": {
                css: cssAssets.map((file) => `/assets/${file}`),
              },
            },
          },
          null,
          2,
        )};\n\nexport default manifest;\n`;

        await writeFile(rscAssetsManifest, manifestSource, "utf8");
      }
    },
  };
}
