import {
	BehaviorSubject,
	combineLatest,
	distinctUntilChanged,
	filter,
	firstValueFrom,
	from,
	map,
	merge,
	mergeMap,
	retry,
	scan,
	take,
	tap,
	timer,
} from "rxjs";

import type { ApiClient } from "@valo-kit/api-client";
import type { Presences, RawPresence } from "@valo-kit/api-client/types";
import type { WebSocketService } from "./websocket.js";

const WS_EVENT_PRESENCES = "OnJsonApiEvent_chat_v4_presences";

export class PresencesService {
	presences$ = new BehaviorSubject<Presences>([]);

	selfPresence$ = this.presences$.pipe(
		filter(presences => presences.some(it => it.puuid === this.api.self.puuid)),
		map(presences => this.api.helpers.getSelfPresence(presences))
	);
	gameState$ = this.selfPresence$.pipe(
		// debounceTime(1000),
		map(presence => this.api.helpers.getGameState([presence]))
	);

	onGameStateChange$ = this.gameState$.pipe(distinctUntilChanged());

	collectedPresences$ = combineLatest([
		this.presences$,
		this.onGameStateChange$,
	]).pipe(
		map(([presences, gameState]) => ({ presences, gameState })),
		scan((pre, curr) => {
			if (pre.gameState !== curr.gameState && curr.gameState === "MENUS") {
				const mergedPresences = this.api.helpers.mergePresences(
					pre.presences,
					curr.presences
				);
				return {
					...curr,
					presences:
						this.api.helpers.getMyPartyPlayersPresences(mergedPresences),
				};
			}

			return {
				...pre,
				gameState: curr.gameState,
				presences: this.api.helpers.mergePresences(
					pre.presences,
					curr.presences
				),
			};
		}),
		map(d => d.presences)
	);

	constructor(
		private api: ApiClient,
		private webSocketService: WebSocketService
	) {
		this.webSocketService.enableListenerForEvent(WS_EVENT_PRESENCES);
		from(api.core.getPresences())
			.pipe(
				take(1),
				tap(p => this.presences$.next(p)),
				retry({ count: 5, delay: 2000 })
			)
			.subscribe();

		const presencesUpdater$ = this.webSocketService.webSocketEvents$.pipe(
			filter(
				res => res.event === WS_EVENT_PRESENCES && res.data.data?.presences
			),
			map(res => {
				const rawPresences: RawPresence[] = res.data.data.presences;
				return this.api.helpers.parseRawPresences(rawPresences);
			}),
			tap(presences => this.presences$.next(presences))
		);

		merge(presencesUpdater$).subscribe();
	}

	async getGameState() {
		return firstValueFrom(this.gameState$);
	}

	async getSelfPresence() {
		return firstValueFrom(this.selfPresence$);
	}

	async getPresencesWithSelfPresence() {
		return [...this.presences$.value, await firstValueFrom(this.selfPresence$)];
	}

	async waitForPresencesOf(playersUUIDs: string[], timeout = 5000) {
		return Promise.any([
			firstValueFrom(
				this.collectedPresences$.pipe(
					filter(presences =>
						playersUUIDs.every(puuid =>
							presences.find(presence => presence.puuid === puuid)
						)
					)
				)
			),
			firstValueFrom(
				timer(timeout).pipe(mergeMap(_ => this.collectedPresences$))
			),
		]);
	}
}
