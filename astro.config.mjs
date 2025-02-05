// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
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
	},
	integrations: [
		react({
			experimentalReactChildren: true,
		}),
		tailwind(),
		icon({
			iconDir: "src/assets/icons",
			svgoOptions: {
				plugins: [
					{
						name: "preset-default",
						params: {
							overrides: {
								removeUselessStrokeAndFill: false,
							},
						},
					},
					{
						name: "removeAttrs",
						params: { attrs: "(fill|stroke)$" },
					},
				],
			},
		}),
	],
});
