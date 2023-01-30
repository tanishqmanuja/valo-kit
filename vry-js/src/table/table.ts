import chalk from "chalk";
import CliTable from "cli-table3";
import { getModuleLogger, getPluginLogger } from "../logger/logger.js";
import PlayerAgentPlugin from "../plugins/player-agent.js";
import PlayerLevelPlugin from "../plugins/player-level.js";
import PlayerNamePlugin from "../plugins/player-name.js";
import PlayerPartyPlugin from "../plugins/player-party.js";
import PlayerPeakRankPlugin from "../plugins/player-peak-rank.js";
import PlayerRankPlugin from "../plugins/player-rank.js";
import PlayerRankedRating from "../plugins/player-rr.js";
import PlayerWeaponsPlugin from "../plugins/player-weapons.js";
import PlayerWinRatePlugin from "../plugins/player-winrate.js";
import SortByLevelPlugin from "../plugins/sort-by-level.js";
import TeamSpacerPlugin from "../plugins/team-spacer.js";
import { stripAnsiCodes } from "../utils/helpers/text.js";
import { TablePluginManager } from "./plugin-manager.js";
import { Table as ITable, TableContext } from "./types/table.js";

const logger = getModuleLogger("Table");

const pluginCtors = [
	PlayerPartyPlugin,
	PlayerAgentPlugin,
	PlayerNamePlugin,
	PlayerWeaponsPlugin,
	PlayerRankPlugin,
	PlayerRankedRating,
	PlayerPeakRankPlugin,
	PlayerWinRatePlugin,
	PlayerLevelPlugin,
	TeamSpacerPlugin,
	SortByLevelPlugin,
];

export class Table implements ITable {
	private _tableHeader = "";
	private _headers: string[] = [];
	private _rows: CliTable.Cell[][] = [];

	private _context: TableContext;

	private pluginManager = new TablePluginManager(this);

	getPluginLogger = getPluginLogger;

	constructor(private initialContext: TableContext) {
		this._context = this.initialContext;
	}

	get context() {
		if (!this._context) {
			throw new Error("No context available for table yet!");
		}
		return this._context;
	}

	setTableHeader(text: string) {
		this._tableHeader = text;
	}

	async initPlugins() {
		this.pluginManager.registerInternalPlugins(...pluginCtors);
		const res = await this.pluginManager.loadPluginsFromFile("./plugins.yaml");
		if (!res) {
			for (const plugin of pluginCtors) {
				this.pluginManager.activatePlugin(plugin.id, undefined, true);
			}

			this.pluginManager.spinner.succeed(
				`Internal Plugins loaded [${this.pluginManager.activatedPlugins.length}/${pluginCtors.length}]`
			);
		}
	}

	async setContext(context: TableContext) {
		let draftContext = context;
		for (let plugin of this.pluginManager.activatedPlugins) {
			if (plugin.onContext) {
				draftContext = { ...(await plugin.onContext(draftContext)) };
			}
		}

		this._context = draftContext;
	}

	async updateContext(context: Partial<TableContext>) {
		await this.setContext({ ...this._context, ...context });
	}

	async applyStateLifecycles() {
		if (!this._context) {
			throw new Error("No context available for table yet!");
		}

		if (this._context.gameState === "MENUS") {
			await this.pluginManager.onStateMenus();

			return;
		}

		if (!this._context.matchData) {
			throw new Error("No Match Data found yet!");
		}

		if (this._context.gameState === "PREGAME") {
			await this.pluginManager.onStatePreGame();
		}

		if (this._context.gameState === "INGAME") {
			await this.pluginManager.onStateInGame();
		}
	}

	addRow(row: CliTable.Cell[], index?: number) {
		if (index) {
			this._rows.splice(index, 0, row);
		}
		this._rows.push(row);
	}

	swapRow(index1: number, index2: number) {
		this._rows[index1] = this._rows.splice(index2, 1, this._rows[index1])[0];
	}

	getColumn(name: string) {
		const headerIndex = this._headers.findIndex(h => h === name);
		if (headerIndex) {
			return this._rows.map(r => r[headerIndex]);
		}
	}

	addColumn(name: string, column: CliTable.Cell[]) {
		this._headers.push(name);
		column.forEach((c, i) => {
			if (this._rows[i]) {
				this._rows[i].push(c);
			} else {
				this._rows[i] = [c];
			}
		});
	}

	addEmptyRow(index?: number) {
		const emptyRow = Array(this._headers.length).fill("");
		if (index) {
			this._rows.splice(index, 0, emptyRow);
		} else {
			this._rows.push(emptyRow);
		}
	}

	clear() {
		this._tableHeader = "";
		this._headers = [];
		this._rows = [];
	}

	display() {
		const cliTable = new CliTable({
			head: this._headers.map(h => ({
				content: chalk.bold(h),
				hAlign: "center",
			})) as any,
			style: {
				compact: true,
				head: [],
			},
		});

		this._rows
			.map(r =>
				r.map(
					content =>
						({
							content,
							hAlign: "center",
						} as CliTable.Cell)
				)
			)
			.forEach(r => cliTable.push(r));

		if (this._tableHeader.length) {
			const tableLength = stripAnsiCodes(
				cliTable.toString().split(/\s/)[0]
			).length;

			const headerLength = stripAnsiCodes(this._tableHeader).length;

			const spaceLength = Math.round((tableLength - headerLength) / 2);

			const space = Array(spaceLength).fill(" ").join("");

			console.log("");
			console.log(`${space}${this._tableHeader}`);
		}

		console.log(cliTable.toString());
		console.log("");
	}
}
