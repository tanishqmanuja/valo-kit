import { build } from "esbuild";
import { esbuildPluginVersionInjector } from "esbuild-plugin-version-injector";
import minimist from "minimist";
import glob from "tiny-glob";

const args = minimist(process.argv.slice(2));

const isWatch = args.watch;
const isProd = args.prod;

const plugins = await glob("src/plugins/*.ts");

const config = {
	entryPoints: ["src/index.ts"],
	bundle: true,
	outdir: "./dist",
	outExtension: {
		".js": ".cjs",
	},
	platform: "node",
	define: {
		"process.env.NODE_ENV": isProd ? `"production"` : `"development"`,
		"process.env.STREAMER_MODE": isProd ? `true` : `false`,
	},
	sourcemap: !isProd,
	minify: isProd,
	plugins: [esbuildPluginVersionInjector()],
};

const pluginsConfig = {
	...config,
	entryPoints: [...plugins],
	outdir: "./dist/plugins",
};

if (isWatch) {
	config.watch = {
		onRebuild(error, _result) {
			if (error) console.error("Build failed");
			else console.log("⚡️ Build success");
		},
	};
}

try {
	if (!args.onlyPlugins) {
		await build(config);
	}
	if (args.plugins || args.onlyPlugins) {
		await build(pluginsConfig);
	}
	if (isWatch) {
		console.log("Watching files...");
	} else {
		console.log("⚡️ Build success");
	}
} catch (e) {
	console.log("Build failed");
	process.exit(1);
}
