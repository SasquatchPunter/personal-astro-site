import { createClient } from "@sanity/client";

const client = createClient({
	projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
	dataset: "production",
	useCdn: false,
	apiVersion: "2025-01-03",
});

export { client };
