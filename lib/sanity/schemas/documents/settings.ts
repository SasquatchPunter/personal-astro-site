import { defineField, defineType } from "sanity";
import { FaFacebook } from "react-icons/fa";

export default defineType({
	name: "settings",
	title: "Site Settings",
	type: "document",
	fieldsets: [
		{
			name: "social",
			title: "Social Settings",
			options: { collapsible: true, collapsed: false },
		},
		{
			name: "social_links",
			title: "Social Links",
			description:
				"Social profile link urls. Leaving one empty removes it from the site.",
			options: { collapsible: true, collapsed: true },
		},
	],
	fields: [
		defineField({
			name: "main_title",
			title: "Main Title",
			description:
				"Title that comes before the page subtitle and is included with every page.",
			type: "string",
			validation: (r) => r.required().min(1).max(32),
		}),
		defineField({
			name: "social_links_facebook",
			title: "Facebook",
			type: "url",
			fieldset: "social_links",
		}),
		defineField({
			name: "social_links_github",
			title: "Github",
			type: "url",
			fieldset: "social_links",
		}),
		defineField({
			name: "social_links_codepen",
			title: "Codepen",
			type: "url",
			fieldset: "social_links",
		}),
		defineField({
			name: "social_links_linkedin",
			title: "LinkedIn",
			type: "url",
			fieldset: "social_links",
		}),
	],
});
