import type { SettingsQueryResult } from "@src/lib/sanity/types/schema";

import { client } from "@src/lib/sanity/client";
import { settingsQuery } from "@src/lib/sanity/query";

/** Fetches the site settings. */
export function getSettings() {
	return client.fetch<SettingsQueryResult>(settingsQuery);
}
