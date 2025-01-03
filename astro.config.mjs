// @ts-check
import {defineConfig} from "astro/config";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
	devToolbar: {enabled: false},
	integrations: [react({experimentalReactChildren: true}), tailwind()],
});
