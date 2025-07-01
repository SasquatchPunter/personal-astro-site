/** Object type to store basic named meta tag mappings.
 *
 * @example <meta name='keywords' content='your, tags'> == {keywords: "your, tags"}
 */
export type BasicMetadata = {
	abstract?: string;
	author?: string;
	description?: string;
	keywords?: string;
	robots?: string;
};

/**
 * Object type to store Http-Equiv meta tag mappings.
 *
 * @example <meta http-equiv='content-security-policy' content='default-src "self"'> == {contentSecurityPolicy: 'default-src "self"'}
 * @link https://www.w3schools.com/tags/att_meta_http_equiv.asp
 */
export type HttpEquivMetadata = {
	contentType?: string;
	refresh?: string;
};
