import type { ApiClient } from "@valo-kit/api-client";
import { objectKeys } from "ts-extras";
import { getModuleLogger } from "../logger/logger.js";
import { pingCommandHandler } from "./ping.js";
import { skinCommandHandler } from "./skin.js";
import type { Command, CommandContext, CommandHandlerFn } from "./types.js";

const MSG_PREFIX = "[vRY]";

const logger = getModuleLogger("Command Handler");

export class CommandManager {
	private commandHandlers: Record<string, CommandHandlerFn> = {};

	constructor(private api: ApiClient) {
		this.use("ping", pingCommandHandler);
		this.use("skin", skinCommandHandler);
	}

	use(name: string, fn: CommandHandlerFn) {
		this.commandHandlers = { ...this.commandHandlers, [name]: fn };
	}

	async handleCommand(command: Command, context: CommandContext) {
		const handlerName = objectKeys(this.commandHandlers).find(
			it => it === command.name
		);
		if (handlerName) {
			try {
				const res = await this.commandHandlers[handlerName](command, context);
				if (res) {
					await this.api.core.postChatMessage(
						command.cid,
						`${MSG_PREFIX} ${res}`,
						"groupchat"
					);
				}
			} catch {
				logger.error(
					`Failed for command ${handlerName} with params ${command.params}`
				);
			}
		}
	}
}
