import type { Tool } from "sanity";

import { definePlugin } from "sanity";
import DeploymentToolComponent from "./components/DeploymentToolComponent";

const tool: Tool = {
	name: "deployment",
	title: "Deployment",
	component: DeploymentToolComponent,
	options: {},
};

const deploymentTool = definePlugin({
	name: "plugins/deployment",
	tools: (prev) => [tool, ...prev],
});

export { deploymentTool };
