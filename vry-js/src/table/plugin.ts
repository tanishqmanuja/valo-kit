import type { Table, TableContext } from "./interfaces.js";

export type MaybePromise<T> = T | Promise<T>;

export abstract class TablePlugin {
	static id: string;
	abstract name: string;

	table: Table;
	context: TableContext;
	flags: string[];

	constructor(table: Table, flags?: string[]) {
		this.table = table;
		this.context = this.table.context;
		this.flags = flags ?? [];
	}

	onContext?(context: TableContext): MaybePromise<TableContext>;
	onStateMenus?(): MaybePromise<void>;
	onStatePreGame?(): MaybePromise<void>;
	onStateInGame?(): MaybePromise<void>;
}

export abstract class OnContext {
	abstract onContext(context: TableContext): MaybePromise<TableContext>;
}

export abstract class OnStateMenus {
	abstract onStateMenus(): MaybePromise<void>;
}

export abstract class OnStatePreGame {
	abstract onStatePreGame(): MaybePromise<void>;
}

export abstract class OnStateInGame {
	abstract onStateInGame(): MaybePromise<void>;
}

class SampleTablePlugin extends TablePlugin {
	static id = "sample-plugin";
	name = "Sample Plugin";
}

export type TablePluginCtor = typeof SampleTablePlugin;
