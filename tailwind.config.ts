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
			spacing: {
				17: "4.25rem",
				18: "4.5rem",
				19: "4.75rem",
				21: "5.25rem",
				22: "5.5rem",
				23: "5.75rem",
			},
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
						hud: {
							line: "#384038",
							marker: "#efe",
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
