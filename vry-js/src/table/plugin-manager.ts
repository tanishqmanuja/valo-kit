import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path/win32";
import { cwd } from "node:process";
import ora from "ora";
import { objectKeys } from "ts-extras";
import { parse } from "yaml";
import { z } from "zod";
import { BaseError } from "../error/base-error.js";
import { getModuleLogger } from "../logger/logger.js";
import { filesAccessible } from "../utils/helpers/files.js";
import type { Table } from "./types/table.js";

import type {
	OnStateInGame,
	OnStateMenus,
	OnStatePreGame,
	TablePlugin,
	TablePluginCtor,
} from "./types/plugin.js";

const logger = getModuleLogger("Plugin Manager");

const pluginsSchema = z.record(
	z.string(),
	z.union([z.array(z.coerce.string()), z.boolean().default(true)])
);

const PluginsConfig = z.object({
	dir: z.string().optional(),
	plugins: pluginsSchema,
});

export type PluginsConfig = z.infer<typeof PluginsConfig>;

export type PluginRegistry = {
	id: string;
	Ctor: TablePluginCtor;
};

export class TablePluginManager
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	internalPlugins: PluginRegistry[] = [];
	externalPlugins: PluginRegistry[] = [];
	activatedPlugins: TablePlugin[] = [];

	spinner = ora();

	constructor(private table: Table) {}

	registerPlugin(plugin: PluginRegistry["Ctor"], isInternal = false) {
		const registry = {
			id: plugin.id,
			Ctor: plugin,
		};
		if (isInternal) {
			this.internalPlugins.push(registry);
			logger.info(`Internal plugin registered ${registry.id}`);
		} else {
			this.externalPlugins.push(registry);
			logger.info(`External plugin registered ${registry.id}`);
		}
	}

	registerInternalPlugins(...plugins: PluginRegistry["Ctor"][]) {
		for (const plugin of plugins) {
			this.registerPlugin(plugin, true);
		}
	}

	registerExternalPlugins(...plugins: PluginRegistry["Ctor"][]) {
		for (const plugin of plugins) {
			this.registerPlugin(plugin, false);
		}
	}

	activatePlugin(
		pluginId: PluginRegistry["id"],
		flags: string[] = [],
		internal = false
	) {
		let plugin;

		const internalRegistry = this.internalPlugins.find(r => r.id === pluginId);
		const externalRegistry = this.externalPlugins.find(r => r.id === pluginId);

		const flagsStr =
			flags.length > 0
				? ` with flag${flags.length > 1 ? "s" : ""} ${flags.join(",")}`
				: "";

		const isDepsFulfilled = (deps: string[]) =>
			deps.every(
				d =>
					this.internalPlugins.find(p => p.id === d) ||
					this.externalPlugins.find(p => p.id === d)
			);

		if (internal) {
			if (!internalRegistry) {
				logger.error(
					`Plugin with id ${pluginId} not found in internal registry`
				);
				return;
			}

			if (!isDepsFulfilled(internalRegistry.Ctor.deps)) {
				logger.error(`Deps not fulfilled for plugin with id ${pluginId}`);
				return;
			}

			plugin = new internalRegistry.Ctor(this.table, flags);
			this.activatedPlugins.push(plugin);
			logger.info(
				`Internal plugin activated ${internalRegistry.id}${flagsStr}`
			);
			return;
		}

		if (!externalRegistry) {
			if (internalRegistry) {
				logger.info(
					`Using Internal plugin with id ${pluginId} not found in external registry`
				);

				if (!isDepsFulfilled(internalRegistry.Ctor.deps)) {
					logger.error(`Deps not fulfilled for plugin with id ${pluginId}`);
					return;
				}

				plugin = new internalRegistry.Ctor(this.table, flags);
				this.activatedPlugins.push(plugin);
				logger.info(`Internal plugin activated ${internalRegistry.id}`);
				return;
			}

			logger.error(`Plugin with id ${pluginId} not found in external registry`);

			return;
		}

		plugin = new externalRegistry.Ctor(this.table, flags);
		this.activatedPlugins.push(plugin);
		logger.info(`External plugin activated ${externalRegistry.id}${flagsStr}`);
	}

	async loadPluginsFromFile(filepath: string) {
		this.spinner.start("Registering Plugins...");

		const config = await this.parsePluginsConfigFile(filepath);

		if (!config) {
			return false;
		}

		if (config.dir) {
			this.registerPluginsFromDir(config.dir, config.plugins);
		}

		for (const pluginId of objectKeys(config.plugins)) {
			const flags = config.plugins[pluginId];
			if (flags) {
				if (flags instanceof Array) {
					this.activatePlugin(pluginId, flags, !config.dir);
				} else {
					this.activatePlugin(pluginId, [], !config.dir);
				}
			}
		}

		this.spinner.succeed(
			`Plugins loaded [${this.activatedPlugins.length}/${
				objectKeys(config.plugins).length
			}]`
		);

		return this.activatePlugin.length > 0;
	}

	private async parsePluginsConfigFile(filepath: string) {
		const absoluteFilePath = join(cwd(), filepath);

		const fileExists = await filesAccessible(absoluteFilePath);

		if (!fileExists) {
			logger.warn(`Plugins file doesnt exist at ${absoluteFilePath}`);
			return;
		}

		try {
			const pluginsConfigYAML = await readFile(absoluteFilePath, "utf-8");
			const pluginsConfigJSON = parse(pluginsConfigYAML);
			return PluginsConfig.parse(pluginsConfigJSON);
		} catch {
			logger.error(`Plugin config parsing failed from ${absoluteFilePath}`);
			return;
		}
	}

	private async registerPluginsFromDir(
		dir: NonNullable<PluginsConfig["dir"]>,
		plugins: PluginsConfig["plugins"]
	) {
		const absoluteDirPath = join(cwd(), dir);
		let dirStats;
		try {
			dirStats = await stat(absoluteDirPath);
		} catch {}

		if (!dirStats?.isDirectory()) {
			logger.warn(`Plugins directory not found at ${absoluteDirPath}`);
		} else {
			const files = await readdir(absoluteDirPath);

			for (const [index, pluginId] of objectKeys(plugins).entries()) {
				this.spinner.text = `Registering Plugins... [${index}/${
					objectKeys(plugins).length
				}]`;

				if (!files.includes(`${pluginId}.cjs`)) {
					logger.warn(`Plugin File ${pluginId}.cjs not found!`);
					break;
				}

				const pluginFileAbsolutePath = join(absoluteDirPath, `${pluginId}.cjs`);

				try {
					let pluginModule = require(`${pluginFileAbsolutePath}`);
					let plugin = pluginModule.default;
					this.registerPlugin(plugin);
				} catch (e) {
					logger.error(
						`Error registering plugin from ${pluginFileAbsolutePath}`
					);
					throw new BaseError("Plugin Registration", pluginId, "Plugin");
				}
			}
		}
	}

	async onStateMenus() {
		const autoPlugins = this.activatedPlugins.filter(
			p => p.execPolicy === "auto"
		);

		const lastPlugins = this.activatedPlugins.filter(
			p => p.execPolicy === "last"
		);

		const promises = await Promise.allSettled(
			autoPlugins.map(plugin => plugin.onStateMenus?.())
		);

		promises.forEach((p, i) => {
			const plugin = autoPlugins[i];
			if (p.status === "fulfilled") {
				p.value?.();
			}
			if (p.status === "rejected") {
				logger.error(`[${plugin.name}][OnStateMenu] ${p.reason}`);
			}
		});

		for (let plugin of lastPlugins) {
			if (plugin.onStateMenus) {
				try {
					await plugin.onStateMenus();
				} catch (e) {
					logger.error(`[${plugin.name}][OnStateMenu] ${e}`);
				}
			}
		}
	}

	async onStatePreGame() {
		const autoPlugins = this.activatedPlugins.filter(
			p => p.execPolicy === "auto"
		);

		const lastPlugins = this.activatedPlugins.filter(
			p => p.execPolicy === "last"
		);

		const promises = await Promise.allSettled(
			autoPlugins.map(plugin => plugin.onStatePreGame?.())
		);

		promises.forEach((p, i) => {
			const plugin = autoPlugins[i];
			if (p.status === "fulfilled") {
				p.value?.();
			}
			if (p.status === "rejected") {
				logger.error(`[${plugin.name}][OnStatePreGame] ${p.reason}`);
			}
		});

		for (let plugin of lastPlugins) {
			if (plugin.onStatePreGame) {
				try {
					await plugin.onStatePreGame();
				} catch (e) {
					logger.error(`[${plugin.name}][OnStatePreGame] ${e}`);
				}
			}
		}
	}

	async onStateInGame() {
		const autoPlugins = this.activatedPlugins.filter(
			p => p.execPolicy === "auto"
		);

		const lastPlugins = this.activatedPlugins.filter(
			p => p.execPolicy === "last"
		);

		const promises = await Promise.allSettled(
			autoPlugins.map(plugin => plugin.onStateInGame?.())
		);

		promises.forEach((p, i) => {
			const plugin = autoPlugins[i];
			if (p.status === "fulfilled") {
				p.value?.();
			}
			if (p.status === "rejected") {
				logger.error(`[${plugin.name}][OnStateInGame] ${p.reason}`);
			}
		});

		for (let plugin of lastPlugins) {
			if (plugin.onStateInGame) {
				try {
					await plugin.onStateInGame();
				} catch (e) {
					logger.error(`[${plugin.name}][OnStateInGame] ${e}`);
				}
			}
		}
	}
}
