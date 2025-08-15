import type { Config } from "tailwindcss";

import plugin from "tailwindcss/plugin";

const addNavMenuVariants = plugin(({ addVariant }) => {
	addVariant("nav-open", "[data-nav-open] &");
});

const config: Config = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		/*
			Default Tailwind breakpoints:
				sm: 640px
				md: 768px
				lg: 1024px
				xl: 1280px
				2xl: 1536px
		*/
		extend: {
			animation: {},
			keyframes: {},
			data: {
				open: "open",
			},
			fontSize: {
				xxs: ["0.625rem", { lineHeight: "0.75rem" }],
			},
			fontFamily: {
				boldonse: "Boldonse",
				dosis: "Dosis",
				iceberg: "Iceberg",
				jersey15: "Jersey15",
				michroma: "Michroma",
				bebasneue: "BebasNeue",
			},
			colors: {
				base: {
					dark: {
						1: "#090909",
						2: "#2a392a",
						text: {
							default: "#dfd",
							link: "#9a9",
							code: "#dfd",
						},
					},
				},
			},
			backgroundImage: {
				noise: "url('/textures/noise.svg')",
			},
		},
	},
	plugins: [addNavMenuVariants],
};

export default config;
