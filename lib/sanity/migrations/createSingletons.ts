import type { Mutation } from "sanity/migrate";

import { defineMigration, createIfNotExists } from "sanity/migrate";

/**
 * Array containing config objects per singleton.
 */
type SingletonMap = {
	_id: string;
	_type: string;
	fields?: object;
}[];

const singletons: SingletonMap = [
	{ _id: "settings", _type: "settings" },
	{
		_id: "deployment",
		_type: "deployment",
		fields: {
			timestamp: new Date().toISOString(),
		},
	},
];

export default defineMigration({
	title: "Ensure singtleton documents are kept as singletons. Preserves draft versions per singleton if enabled.",
	async *migrate() {
		const mutations: Mutation[] = [];

		/* Create singletons that don't already exist */
		for (const { _id, _type, fields } of singletons) {
			mutations.push(
				createIfNotExists({
					_id,
					_type,
					...fields,
				}),
			);
		}

		yield mutations;
	},
});
