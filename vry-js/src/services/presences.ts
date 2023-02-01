import type { ApiClient } from "@valo-kit/api-client";
import type { Presences, RawPresence } from "@valo-kit/api-client/types";
import {
	BehaviorSubject,
	combineLatest,
	defer,
	distinctUntilChanged,
	filter,
	firstValueFrom,
	from,
	interval,
	map,
	merge,
	mergeMap,
	retry,
	scan,
	shareReplay,
	switchMap,
	take,
	tap,
	timer,
	withLatestFrom,
} from "rxjs";
import type { WebSocketService } from "./websocket.js";

const WS_EVENT_PRESENCES = "OnJsonApiEvent_chat_v4_presences";

export class PresencesService {
	presences$ = new BehaviorSubject<Presences>([]);
	collectedPresences$ = new BehaviorSubject<Presences>([]);

	selfPresence$ = this.presences$.pipe(
		filter(presences => presences.some(it => it.puuid === this.api.self.puuid)),
		map(presences => this.api.helpers.getSelfPresence(presences)),
		shareReplay(1)
	);

	gameState$ = this.selfPresence$.pipe(
		map(presence => this.api.helpers.getGameState([presence])),
		distinctUntilChanged()
	);

	constructor(
		private api: ApiClient,
		private webSocketService: WebSocketService
	) {
		this.webSocketService.enableListenerForEvent(WS_EVENT_PRESENCES);

		const updatePresencesThroughApiOnce$ = defer(() =>
			from(api.core.getPresences())
		).pipe(
			tap(p => this.presences$.next(p)),
			retry({ count: 5, delay: 2000 }),
			take(1)
		);

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

		const collectedPresencesUpdater$ = combineLatest([
			this.presences$,
			this.selfPresence$,
			this.gameState$,
		]).pipe(
			map(([presences, selfPresence, gameState]) => ({
				presences: this.api.helpers.mergePresences([selfPresence], presences),
				gameState,
			})),
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
			map(d => d.presences),
			tap(p => this.collectedPresences$.next(p))
		);

		merge(
			updatePresencesThroughApiOnce$,
			presencesUpdater$,
			collectedPresencesUpdater$
		).subscribe();
	}

	async getGameState() {
		return firstValueFrom(this.gameState$);
	}

	async getSelfPresence() {
		return firstValueFrom(this.selfPresence$);
	}

	async getPresencesWithSelfPresence() {
		return this.api.helpers.mergePresences(
			await firstValueFrom(this.collectedPresences$),
			[await firstValueFrom(this.selfPresence$)]
		);
	}

	async waitForPresencesOf(playersUUIDs: string[], timeout = 5000) {
		const presencesApi$ = defer(() =>
			from(this.api.core.getPresences()).pipe(retry({ delay: 2000 }))
		);

		const presencesUpdater$ = interval(2000).pipe(
			switchMap(() => presencesApi$),
			tap(p => this.presences$.next(p))
		);

		const collectedPresences$ = this.collectedPresences$.pipe(
			withLatestFrom(presencesUpdater$, (p, _) => p),
			filter(presences =>
				playersUUIDs.every(puuid =>
					presences.find(presence => presence.puuid === puuid)
				)
			)
		);

		return firstValueFrom(
			merge(
				collectedPresences$,
				timer(timeout).pipe(mergeMap(() => this.collectedPresences$))
			)
		);
	}
}
