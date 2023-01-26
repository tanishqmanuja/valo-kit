import type { ApiClient } from "@valo-kit/api-client";
import type {
	Agent,
	CompetitiveTiers,
	Content,
	CoreGameLoadouts,
	CoreGameMatchData,
	GameState,
	Map,
	PreGameLoadouts,
	PreGameMatchData,
	Presences,
	Weapon,
} from "@valo-kit/api-client/types";
import type { Cell } from "cli-table3";
import CliTable3 from "cli-table3";
import type { Logger } from "winston";
import type { TablePlugin } from "./plugin.js";

export type TableContext = {
	api: ApiClient;
	content: Content;
	competitiveTiers: CompetitiveTiers[];
	agents: Agent[];
	weapons: Weapon[];
	maps: Map[];
	gameState: GameState;
	presences: Presences;
	matchData?: PreGameMatchData | CoreGameMatchData;
	matchLoadouts?: PreGameLoadouts | CoreGameLoadouts;
};

export abstract class Table {
	abstract get context(): TableContext;
	abstract addRow(row: Cell[], index?: number): void;
	abstract swapRow(index1: number, index2: number): void;
	abstract getColumn(name: string): CliTable3.Cell[] | undefined;
	abstract addColumn(name: string, column: Cell[]): void;
	abstract addEmptyRow(index?: number): void;
	abstract getPluginLogger(plugin: TablePlugin): Logger;
}
