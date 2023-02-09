import { filter, map, Observable } from "rxjs";
import { Command } from "../commands/types.js";
import { ChatService } from "./chat.js";

export class CommandService {
	command$: Observable<Command>;

	constructor(private chatService: ChatService) {
		this.command$ = this.chatService.partyMessages$.pipe(
			filter(msg => msg.body.startsWith("!")),
			map(msg => {
				const from = msg.puuid;

				const commandRegex = /^!(?<name>\w+)(?: (?<params>.*))?$/gm;
				const { name, params } =
					commandRegex.exec(msg.body.toLowerCase())?.groups ?? {};

				if (!name) {
					return undefined;
				}
				const cmd: Command = {
					cid: msg.cid,
					from,
					name,
					params: params?.split(/\s/) ?? [],
					paramsRaw: params,
				};
				return cmd;
			}),
			filter(Boolean)
		);
	}
}
