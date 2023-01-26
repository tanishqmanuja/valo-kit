import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	clean: true,
	splitting: false,
	dts: {
		entry: {
			index: "src/index.ts",
			types: "src/types/index.ts",
		},
	},
	sourcemap: true,
	target: "esnext",
	format: ["esm"],
});
