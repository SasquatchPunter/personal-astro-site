/** @type {import('tailwindcss').Config} */
export default {
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
			colors: {
				base: {
					dark: {
						1: "#090909",
						2: "#2a392a",
						text: {
							1: "#fff",
							link: "#9a9",
							code: "#dfd",
							hightlight: {
								1: "#f0f",
							},
						},
					},
				},
			},
		},
	},
	plugins: [],
};
