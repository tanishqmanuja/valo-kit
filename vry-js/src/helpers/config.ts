import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { parse } from "yaml";
import z from "zod";

const FeaturesSchema = z.record(z.string(), z.boolean());

const ConfigSchema = z.object({
	features: FeaturesSchema,
});

export type Config = z.infer<typeof ConfigSchema>;

const DEFAULT_CONFIG: Config = {
	features: {
		"discord-rpc": true,
	},
};

export async function getConfig(path: string) {
	const absoluteFilePath = join(cwd(), path);

	try {
		const configYAML = await readFile(absoluteFilePath, "utf-8");
		const configJSON = parse(configYAML);
		const userConfig = ConfigSchema.parse(configJSON);
		return { ...DEFAULT_CONFIG, ...userConfig };
	} catch {
		return DEFAULT_CONFIG;
	}
}
