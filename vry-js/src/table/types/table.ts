import type { ApiClient } from "@valo-kit/api-client";
import type {
	CoreGameLoadouts,
	CoreGameMatchData,
	GameState,
	MMR,
	PartyInfo,
	PlayerName,
	PreGameLoadouts,
	PreGameMatchData,
	Presences,
} from "@valo-kit/api-client/types";
import type CliTable3 from "cli-table3";
import type { Cell } from "cli-table3";
import type { Logger } from "winston";
import type { EssentialContent } from "../../helpers/content.js";
import type { TablePlugin } from "./plugin.js";

export type TableContext = {
	api: ApiClient;
	essentialContent: EssentialContent;
	gameState: GameState;
	presences: Presences;
	partyInfo?: PartyInfo;
	playerUUIDs?: string[];
	playerNames?: PlayerName[];
	playerMMRs?: MMR[];
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
