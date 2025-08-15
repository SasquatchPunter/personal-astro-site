// @ts-check
import { defineConfig } from "astro/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import glsl from "vite-plugin-glsl";

export default defineConfig({
	devToolbar: { enabled: false },
	vite: {
		plugins: [
			glsl({
				include: ["**/*.fs", "**/*.vs", "**/*.glsl"],
				defaultExtension: "glsl",
				watch: true,
			}),
		],
		resolve: {
			alias: {
				"@src": path.resolve(__dirname, "./src"),
			},
		},
	},
	integrations: [
		react({
			experimentalReactChildren: true,
		}),
		tailwind(),
	],
});
