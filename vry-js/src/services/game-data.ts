import {
	CoreGameLoadouts,
	CoreGameMatchData,
	GameState,
	MMR,
	PartyInfo,
	PlayerName,
	PreGameLoadouts,
	PreGameMatchData,
	Presences,
} from "@valo-kit/api-client/types";
import {
	Observable,
	Subject,
	bufferCount,
	merge,
	retry,
	shareReplay,
	startWith,
	switchMap,
	tap,
	throttleTime,
} from "rxjs";
import { MergeExclusive } from "type-fest";
import { retryPromise } from "../utils/helpers/rxjs.js";
import { ApiService } from "./api.js";
import { MessagesService } from "./messages.js";
import { PresencesService } from "./presences.js";
import { SpinnerService } from "./spinner.js";

type BaseData = {
	previousGameState: GameState;
	gameState: GameState;
	presences: Presences;
	playerUUIDs: string[];
	playerNames: PlayerName[];
	playerMMRs: MMR[];
};

export type MenuData = BaseData & {
	partyId: string;
	partyInfo: PartyInfo;
};

export type PreGameData = BaseData & {
	matchId: string;
	matchData: PreGameMatchData;
	matchLoadouts: PreGameLoadouts;
};

export type InGameData = BaseData & {
	matchId: string;
	matchData: CoreGameMatchData;
	matchLoadouts: CoreGameLoadouts;
};

export type GameData = MergeExclusive<
	MenuData,
	MergeExclusive<PreGameData, InGameData>
>;

export class GameDataService {
	gameData$: Observable<GameData>;

	private _manualUpdateRequest$ = new Subject();
	constructor(
		private apiService: ApiService,
		private presencesService: PresencesService,
		private messagesService: MessagesService,
		private spinnerService: SpinnerService
	) {
		const initialGameState: GameState = "MENUS";
		const bufferedGameStates$ = this.presencesService.gameState$.pipe(
			startWith(initialGameState),
			bufferCount(2, 1),
			shareReplay(1)
		);

		this.gameData$ = merge(
			this.presencesService.gameState$,
			this._manualUpdateRequest$.pipe(throttleTime(5 * 1000))
		).pipe(
			switchMap(() => bufferedGameStates$),
			tap(() => this.spinner.start("Fetching Game Data...")),
			switchMap(async ([previousGameState, gameState]) => {
				let data;

				if (gameState === "MENUS") {
					data = await this.getMenuData();
				}
				if (gameState === "PREGAME") {
					const fetchUpdatedAgents = previousGameState === "PREGAME";
					data = await this.getPreGameData(fetchUpdatedAgents);
				}
				if (gameState === "INGAME") {
					data = await this.getInGameData();
				}

				if (!data) {
					throw new Error("Failed to get data.");
				}

				return { previousGameState, gameState, ...data };
			}),
			tap({
				error: () => this.spinner.stop(),
			}),
			retry({ delay: 2000, count: 2 })
		);
	}

	private get spinner() {
		return this.spinnerService.spinner;
	}

	get manualUpdateRequest$() {
		return this._manualUpdateRequest$.asObservable();
	}

	requestUpdate() {
		this._manualUpdateRequest$.next(true);
	}

	private get api() {
		return this.apiService.api;
	}

	private async getMenuData(): Promise<
		Omit<MenuData, "previousGameState" | "gameState">
	> {
		this.spinner.start("Getting Party Id...");
		const partyId = await this.messagesService.getPartyId();

		this.spinner.start("Fetching Party Info...");
		const partyInfo = await retryPromise(
			this.api.core.getSelfPartyInfo(partyId)
		);

		const playerUUIDs = this.api.helpers.getPlayerUUIDs(partyInfo.Members);

		this.spinner.start("Fetching Player Names...");
		const playerNames = await retryPromise(
			this.api.core.getPlayerNames(playerUUIDs)
		);

		this.spinner.start("Fetching Player MMRs...");
		const playerMMRs = await retryPromise(
			this.api.core.getPlayerMMRs(playerUUIDs)
		);

		this.spinner.start("Waiting for Self Presence...");
		const presences =
			await this.presencesService.getPresencesWithSelfPresence();

		return {
			partyId,
			partyInfo,
			playerUUIDs,
			playerNames,
			playerMMRs,
			presences,
		};
	}

	private async getPreGameData(
		cached = true
	): Promise<Omit<PreGameData, "previousGameState" | "gameState">> {
		this.spinner.start("Getting Match Id...");
		const matchId = await this.messagesService.getPreGameMatchId();

		this.spinner.start("Fetching PreGame Match Data....");
		const matchData = await retryPromise(
			this.api.core.getPreGameMatchData(matchId, !cached)
		);

		this.spinner.start("Fetching PreGame Match Loadouts...");
		const matchLoadouts = await retryPromise(
			this.api.core.getPreGameLoadouts(matchId)
		);

		const playerUUIDs = this.api.helpers.getPlayerUUIDs(
			matchData.AllyTeam.Players
		);

		this.spinner.start("Fetching Player Names...");
		const playerNames = await retryPromise(
			this.api.core.getPlayerNames(playerUUIDs)
		);

		this.spinner.start("Fetching Player MMRs...");
		const playerMMRs = await retryPromise(
			this.api.core.getPlayerMMRs(playerUUIDs)
		);

		this.spinner.start("Waiting for Player Presences...");
		const presences = await this.presencesService.waitForPresencesOf(
			playerUUIDs,
			playerUUIDs.length * 1000
		);

		return {
			matchId,
			matchData,
			matchLoadouts,
			playerUUIDs,
			playerNames,
			playerMMRs,
			presences,
		};
	}

	private async getInGameData(): Promise<
		Omit<InGameData, "previousGameState" | "gameState">
	> {
		this.spinner.start("Getting Match Id...");
		const matchId = await this.messagesService.getCoreGameMatchId();

		this.spinner.start("Fetching CoreGame Match Data...");
		const matchData = await retryPromise(
			this.api.core.getCoreGameMatchData(matchId)
		);

		this.spinner.start("Fetching CoreGame Match Loadouts...");
		const matchLoadouts = await retryPromise(
			this.api.core.getCoreGameLoadouts(matchId)
		);

		const playerUUIDs = this.api.helpers.getPlayerUUIDs(matchData.Players);

		this.spinner.start("Fetching Player Names...");
		const playerNames = await retryPromise(
			this.api.core.getPlayerNames(playerUUIDs)
		);

		this.spinner.start("Fetching Player MMRs...");
		const playerMMRs = await retryPromise(
			this.api.core.getPlayerMMRs(playerUUIDs)
		);

		this.spinner.start("Waiting for Player Presences...");
		const presences = await this.presencesService.waitForPresencesOf(
			playerUUIDs,
			playerUUIDs.length * 1000
		);

		return {
			matchId,
			matchData,
			matchLoadouts,
			playerUUIDs,
			playerNames,
			playerMMRs,
			presences,
		};
	}
}
