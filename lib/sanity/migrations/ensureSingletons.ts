import type { Mutation } from "sanity/migrate";

import { defineMigration, createIfNotExists, delete_ } from "sanity/migrate";

/**
 * Object containing key-value pairs of document types and assigned ids.
 */
type SingletonMap = { [key: string]: string };

const singletonDocuments: SingletonMap = {
	settings: "settings",
};

export default defineMigration({
	title: "Ensure singtleton documents are kept as singletons. Preserves draft versions.",
	documentTypes: Object.keys(singletonDocuments),
	migrate: {
		document: (doc, context) => {
			const mutations: Mutation[] = [];

			const acceptedIds = [
				singletonDocuments[doc._type],
				`drafts.${singletonDocuments[doc._type]}`,
			];

			if (!acceptedIds.includes(doc._id)) {
				console.log(`Deleting ${doc._id} from Sanity...`);
				mutations.push(delete_(doc._id));
			}

			mutations.push(
				createIfNotExists({
					_type: doc._type,
					_id: singletonDocuments[doc._type],
				}),
			);

			return mutations;
		},
	},
});
