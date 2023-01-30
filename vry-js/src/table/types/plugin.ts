import type { MaybePromise } from "../../utils/helpers/types.js";
import type { Table, TableContext } from "./table.js";

export type ExecPolicy = "auto" | "last";
export type SyncTask = () => any;

export abstract class TablePlugin {
	static id: string;
	static deps: string[] = [];

	abstract name: string;
	execPolicy: ExecPolicy = "auto";

	table: Table;
	context: TableContext;
	flags: string[];

	constructor(table: Table, flags?: string[]) {
		this.table = table;
		this.context = this.table.context;
		this.flags = flags ?? [];
	}

	onContext?(context: TableContext): MaybePromise<TableContext>;
	onStateMenus?(): MaybePromise<SyncTask | void>;
	onStatePreGame?(): MaybePromise<SyncTask | void>;
	onStateInGame?(): MaybePromise<SyncTask | void>;
}

export abstract class OnContext {
	abstract onContext(context: TableContext): MaybePromise<TableContext>;
}

export abstract class OnStateMenus {
	abstract onStateMenus(): MaybePromise<SyncTask | void>;
}

export abstract class OnStatePreGame {
	abstract onStatePreGame(): MaybePromise<SyncTask | void>;
}

export abstract class OnStateInGame {
	abstract onStateInGame(): MaybePromise<SyncTask | void>;
}

class SampleTablePlugin extends TablePlugin {
	static id = "sample-plugin";
	static deps: string[] = [];

	name = "Sample Plugin";
	execPolicy: ExecPolicy = "auto";
}

export type TablePluginCtor = typeof SampleTablePlugin;
