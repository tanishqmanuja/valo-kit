import type { ApiClient } from "@valo-kit/api-client";
import {
	concatAll,
	debounceTime,
	distinctUntilKeyChanged,
	filter,
	map,
	Observable,
} from "rxjs";
import type { Command } from "../commands/types.js";
import type { WebSocketService } from "./websocket.js";

export type Message = {
	body: string;
	cid: string;
	game_name: string;
	game_tag: string;
	id: string;
	mid: string;
	name: string;
	pid: string;
	puuid: string;
	read: boolean;
	region: string;
	time: string;
	type: string;
};

const WS_EVENT_CHAT_MESSAGES = "OnJsonApiEvent_chat_v5_messages";

export class ChatService {
	messages$: Observable<Message>;
	partyMessages$: Observable<Message>;
	commands$: Observable<Command>;

	constructor(
		private api: ApiClient,
		private webSocketService: WebSocketService
	) {
		this.webSocketService.enableListenerForEvent(WS_EVENT_CHAT_MESSAGES);

		this.messages$ = this.webSocketService.webSocketEvents$.pipe(
			filter(
				res =>
					res.event === WS_EVENT_CHAT_MESSAGES &&
					res.data.data?.messages &&
					res.data.eventType === "Update"
			),
			map(res => res.data.data.messages as Message[]),
			concatAll(),
			distinctUntilKeyChanged("mid"),
			debounceTime(1000)
		);

		this.partyMessages$ = this.messages$.pipe(
			filter(msg => msg.mid.includes("ares-parties"))
		);

		this.commands$ = this.partyMessages$.pipe(
			filter(msg => msg.body.startsWith("!")),
			map(msg => {
				const from = msg.puuid;

				const commandRegex = /^!(?<name>\w+)(?: (?<params>.*))?$/gm;
				const { name, params } = commandRegex.exec(msg.body)?.groups ?? {};

				if (!name) {
					return undefined;
				}
				const cmd: Command = {
					cid: msg.cid,
					from,
					name,
					params: params?.split(/\s/) ?? [],
				};
				return cmd;
			}),
			filter(Boolean)
		);
	}
}
