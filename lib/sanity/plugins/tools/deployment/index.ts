import type { Tool } from "sanity";

import { definePlugin } from "sanity";
import deploymentSchema from "./schema";

import DeploymentToolComponent from "./components/DeploymentToolComponent";

const tool: Tool = {
	name: "deployment",
	title: "Deployment",
	component: DeploymentToolComponent,
};

const schema = deploymentSchema;

const deploymentTool = definePlugin({
	name: "plugins/deployment",
	document: {
		newDocumentOptions: (prev, context) => {
			return prev.filter(({ templateId }) => templateId !== schema.name);
		},
	},
	tools: (prev) => [tool, ...prev],
	schema: { types: [deploymentSchema] },
});

export { deploymentTool };
