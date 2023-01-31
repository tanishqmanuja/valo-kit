import type { TableContext } from "../table/types/table.js";
import type { MaybePromise } from "../utils/helpers/types.js";

export type Command = {
	cid: string;
	from: string;
	name: string;
	params: string[];
};

export type CommandContext = TableContext;

export type CommandHandlerFn = (
	command: Command,
	context: CommandContext
) => MaybePromise<string | undefined>;
