import { ApiClient } from "@valo-kit/api-client";
import {
	defer,
	distinctUntilChanged,
	filter,
	firstValueFrom,
	from,
	map,
	merge,
	ReplaySubject,
	retry,
	tap,
} from "rxjs";

import type { WebSocketService } from "./websocket.js";

const WS_EVENT_MESSAGES = "OnJsonApiEvent_riot-messaging-service_v1_messages";

type MatchIdEvent = {
	service: "core-game" | "pregame";
	id: string;
};

export class MessagesService {
	partyId$ = new ReplaySubject<string>(1);
	matchId$ = new ReplaySubject<MatchIdEvent>(1);

	constructor(
		private api: ApiClient,
		private webSocketService: WebSocketService
	) {
		this.webSocketService.enableListenerForEvent(WS_EVENT_MESSAGES);

		const partyIdUpdater$ = this.webSocketService.webSocketEvents$.pipe(
			filter(res => res.event === WS_EVENT_MESSAGES && res.data.data),
			filter(
				res =>
					res.data.data.service === "parties" &&
					res.data.data.resource.includes("ares-parties/parties/v1/parties/")
			),
			map(res => {
				const { resource } = res.data.data;
				return resource.split("/").pop();
			}),
			distinctUntilChanged(),
			tap(partyId => this.partyId$.next(partyId))
		);

		const matchIdUpdater$ = this.webSocketService.webSocketEvents$.pipe(
			filter(res => res.event === WS_EVENT_MESSAGES && res.data.data),
			filter(
				res =>
					(res.data.data.service === "pregame" ||
						res.data.data.service === "core-game") &&
					res.data.data.resource.includes("/v1/matches/")
			),
			map(res => {
				const { service, resource } = res.data.data;

				const matchIdEvent: MatchIdEvent = {
					service,
					id: resource.split("/").pop(),
				};

				return matchIdEvent;
			}),
			distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
			tap(matchIdEvent => this.matchId$.next(matchIdEvent))
		);

		merge(partyIdUpdater$, matchIdUpdater$).subscribe();
	}

	async getPartyId() {
		const partyIdApi$ = defer(() =>
			from(this.api.core.getSelfPartyId()).pipe(retry({ delay: 2000 }))
		);
		const partyId$ = merge(this.partyId$, partyIdApi$).pipe(filter(Boolean));

		return firstValueFrom(partyId$);
	}

	async getPreGameMatchId() {
		const matchIdWs$ = this.matchId$.pipe(
			filter(ev => ev.service === "pregame"),
			map(ev => ev.id)
		);
		const matchIdApi$ = defer(() =>
			from(this.api.core.getPreGameMatchId()).pipe(retry({ delay: 2000 }))
		);
		const matchId$ = merge(matchIdWs$, matchIdApi$).pipe(filter(Boolean));

		return firstValueFrom(matchId$);
	}

	async getCoreGameMatchId() {
		const matchIdWs$ = this.matchId$.pipe(
			filter(ev => ev.service === "core-game"),
			map(ev => ev.id)
		);
		const matchIdApi$ = defer(() =>
			from(this.api.core.getCoreGameMatchId()).pipe(retry({ delay: 2000 }))
		);
		const matchId$ = merge(matchIdWs$, matchIdApi$).pipe(filter(Boolean));

		return firstValueFrom(matchId$);
	}
}
