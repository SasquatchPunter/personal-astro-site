import { createClient } from "@sanity/client";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const devToken = import.meta.env.PUBLIC_SANITY_DEV_TOKEN;
const apiVersion = "2025-01-03";

const client = import.meta.env.PROD
	? createClient({
			projectId,
			dataset: "production",
			useCdn: false,
			apiVersion,
		})
	: createClient({
			projectId,
			dataset: "development",
			useCdn: false,
			apiVersion,
			token: devToken,
		});

export { client };
