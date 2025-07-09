/** Object type to store basic named meta tag mappings.
 *
 * @example <meta name='keywords' content='your, tags'> == {keywords: "your, tags"}
 */
export type Metadata = {
	abstract?: string;
	author?: string;
	description?: string;
	keywords?: string;
	robots?: string;
	httpContentType?: string;
	httpRefresh?: string;
};
