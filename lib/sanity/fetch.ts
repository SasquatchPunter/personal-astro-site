import type { SettingsQueryResult } from "lib/sanity/types/schema";

import { client } from "lib/sanity/client";
import { settingsQuery } from "lib/sanity/query";

/** Fetches the site settings. */
export function getSettings() {
	return client.fetch<SettingsQueryResult>(settingsQuery);
}
