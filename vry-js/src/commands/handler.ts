import { ApiClient } from "@valo-kit/api-client";
import { objectKeys } from "ts-extras";
import { pingCommandHandler } from "./ping.js";
import { Command, CommandHandlerFn } from "./types.js";

const MSG_PREFIX = "[vRY]";

export class CommandManager {
	private commandHandlers: Record<string, CommandHandlerFn> = {};

	constructor(private api: ApiClient) {
		this.use("ping", pingCommandHandler);
	}

	use(name: string, fn: CommandHandlerFn) {
		this.commandHandlers = { ...this.commandHandlers, [name]: fn };
	}

	async handleCommand(command: Command) {
		const handlerName = objectKeys(this.commandHandlers).find(
			it => it === command.name
		);
		if (handlerName) {
			const res = await this.commandHandlers[handlerName](command);
			await this.api.core.postChatMessage(command.cid, `${MSG_PREFIX} ${res}`);
		}
	}
}
