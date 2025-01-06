import { createClient } from "@sanity/client";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
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
			token: import.meta.env.PUBLIC_SANITY_TOKEN,
		});

export { client };
