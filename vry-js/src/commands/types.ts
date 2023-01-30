import { MaybePromise } from "../utils/helpers/types.js";

export type Command = {
	cid: string;
	from: string;
	name: string;
	params: string[];
};

export type CommandHandlerFn = (command: Command) => MaybePromise<string>;
