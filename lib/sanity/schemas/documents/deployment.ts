import { defineType } from "sanity";

export default defineType({
	name: "deployment",
	description:
		"This serves as a ghost document to trigger deployment webhooks.",
	type: "document",
	fields: [],
});
