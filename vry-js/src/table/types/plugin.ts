import type { MaybePromise } from "../../utils/helpers/types.js";
import type { Table, TableContext } from "./table.js";

export type ExecPolicy = "auto" | "last";
export type SyncTask = () => any;

export abstract class TablePlugin {
	static id: string;
	static deps: string[] = [];

	abstract name: string;
	execPolicy: ExecPolicy = "auto";
	isEssential: boolean = false;

	table: Table;
	flags: string[];

	constructor(table: Table, flags?: string[]) {
		this.table = table;
		this.flags = flags ?? [];
	}

	get context() {
		return this.table.context;
	}

	get api() {
		return this.table.context.api;
	}

	get essentialContent() {
		return this.table.context.essentialContent;
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
	isEssential: boolean = false;
}

export type TablePluginCtor = typeof SampleTablePlugin;
