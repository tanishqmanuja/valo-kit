import { ApiClient } from "@valo-kit/api-client";
import {
	distinctUntilChanged,
	filter,
	firstValueFrom,
	map,
	merge,
	ReplaySubject,
	tap,
} from "rxjs";

import type { WebSocketService } from "./websocket.js";

const WS_EVENT_MESSAGES = "OnJsonApiEvent_riot-messaging-service_v1_messages";

type MatchIdEvent = {
	service: "core-game" | "pregame";
	id: string;
};

export class MessagesService {
	matchId$ = new ReplaySubject<MatchIdEvent>(1);

	constructor(
		private api: ApiClient,
		private webSocketService: WebSocketService
	) {
		this.webSocketService.enableListenerForEvent(WS_EVENT_MESSAGES);

		const matchId$ = this.webSocketService.webSocketEvents$.pipe(
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

		merge(matchId$).subscribe();
	}

	async getPreGameMatchId() {
		return Promise.any([
			firstValueFrom(
				this.matchId$.pipe(
					filter(ev => ev.service === "pregame"),
					map(ev => ev.id)
				)
			),
			this.api.core.getPreGameMatchId(),
		]);
	}

	async getCoreGameMatchId() {
		return Promise.any([
			firstValueFrom(
				this.matchId$.pipe(
					filter(ev => ev.service === "core-game"),
					map(ev => ev.id)
				)
			),
			this.api.core.getCoreGameMatchId(),
		]);
	}
}
