/* Base Config for Sanity */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import settings from "@src/lib/sanity/schemas/documents/settings";

/* Tool Configs */
const structure = structureTool({
	structure: (S) =>
		S.list()
			.title("Content")
			.items([
				S.listItem()
					.title(settings.title || "Title")
					.id("settings")
					.child(
						S.document()
							.title(settings.title || "Title")
							.schemaType("settings")
							.documentId("settings"),
					),
			]),
});
const vision = visionTool();

let projectId: string;
let dataset: string;

if (typeof process !== "undefined") {
	projectId = process.env.PUBLIC_SANITY_PROJECT_ID!;
	dataset =
		process.env.NODE_ENV === "production" ? "production" : "development";
} else {
	projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
	dataset = import.meta.env.PROD ? "production" : "development";
}

const basePath = "/admin";
const plugins = [structure, vision];
const schema = { types: [settings] };

const config = defineConfig({
	projectId,
	dataset,
	basePath,
	plugins,
	schema,
});

export default config;
