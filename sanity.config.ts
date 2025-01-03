import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";

const config = defineConfig({
	projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
	dataset: "production",
	basePath: "/admin",
	plugins: [structureTool(), visionTool()],
	schema: {
		types: [],
	},
});

export default config;
