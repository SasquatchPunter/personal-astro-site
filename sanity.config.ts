/* Base Config for Sanity */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import settingsSchema from "lib/sanity/schemas/documents/settings";
import deploymentSchema from "lib/sanity/schemas/documents/deployment";

/* Tool Configs */
const structure = structureTool({
	structure: (S) =>
		S.list()
			.title("Content")
			.items([
				S.listItem()
					.title(settingsSchema.title || "Title")
					.id("settings")
					.child(
						S.document()
							.title(settingsSchema.title || "Title")
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
const schema = { types: [settingsSchema, deploymentSchema] };

const config = defineConfig({
	projectId,
	dataset,
	basePath,
	plugins,
	schema,
	document: {
		actions: (prev, context) => {
			if (context.schemaType === "settings") {
				const publish = prev.find(({ action }) => action === "publish");
				return publish ? [publish] : [];
			}
			return prev;
		},
	},
});

export default config;
