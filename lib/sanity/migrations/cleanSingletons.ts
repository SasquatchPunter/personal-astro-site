import type { Mutation } from "sanity/migrate";

import { defineMigration, del } from "sanity/migrate";

/**
 * Array containing config objects per singleton.
 */
type SingletonMap = {
	_id: string;
	_type: string;
	preserveDrafts: boolean;
}[];

const singletons: SingletonMap = [
	{ _id: "settings", _type: "settings", preserveDrafts: true },
	{
		_id: "deployment",
		_type: "deployment",
		preserveDrafts: false,
	},
];

const acceptedIds: { [key: string]: string[] } = {};

singletons.forEach(({ _id, _type, preserveDrafts }) => {
	acceptedIds[_type] = [_id];
	if (preserveDrafts) acceptedIds[_type].push(`drafts.${_id}`);
});

export default defineMigration({
	title: "Ensure singtleton documents are kept as singletons. Preserves draft versions per singleton if enabled.",
	documentTypes: singletons.map(({ _type }) => _type),
	migrate: {
		document: ({ _id, _type }, context) => {
			const mutations: Mutation[] = [];

			if (!acceptedIds[_type].includes(_id)) {
				mutations.push(del(_id));
			}

			return mutations;
		},
	},
});
