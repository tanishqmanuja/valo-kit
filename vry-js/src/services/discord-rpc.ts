import { ApiClient } from "@valo-kit/api-client";
import { GameState } from "@valo-kit/api-client/types";
import DiscordRPC, { AutoClient } from "discord-auto-rpc";
import {
	BehaviorSubject,
	filter,
	merge,
	retry,
	skipUntil,
	tap,
	timer,
} from "rxjs";
import { getQueueName } from "../formatters/queue.js";
import { EssentialContent } from "../helpers/content.js";
import { getModuleLogger } from "../logger/logger.js";
import { PresencesService } from "./presences.js";

const CLIENT_ID = "1070992075128057886";

const logger = getModuleLogger("Discord RPC Service");

export class DiscordRPCService {
	private client: DiscordRPC.AutoClient;
	private isReady$ = new BehaviorSubject(false);

	private baseActivity: DiscordRPC.Presence = {
		largeImageKey: "vry",
		buttons: [
			{
				label: "What's This? 👀",
				url: "https://github.com/tanishqmanuja/valo-kit",
			},
		],
	};

	constructor(
		private api: ApiClient,
		private presencesService: PresencesService,
		private content: EssentialContent
	) {
		this.client = new AutoClient({ transport: "ipc" });

		this.client.once("ready", async () => {
			this.isReady$.next(true);
		});

		this.client.endlessLogin({ clientId: CLIENT_ID });

		const discordRPCUpdater$ = merge(
			presencesService.gameState$,
			timer(0, 15 * 1000)
		).pipe(
			skipUntil(this.isReady$.pipe(filter(Boolean))),
			tap(async () => {
				await this.updateActivity();
			}),
			retry({
				delay: err => {
					logger.error(err);
					return timer(2000);
				},
			})
		);

		discordRPCUpdater$.subscribe();
	}

	async updateActivity() {
		const gameStateDisplayName: Record<GameState, string> = {
			MENUS: "In-Menus",
			PREGAME: "Agent Select",
			INGAME: "In-Game",
		};

		const gameState = await this.presencesService.getGameState();
		const selfPresence = await this.presencesService.getSelfPresence();

		const mapName = (
			await this.api.external.getMapFromMapUrl(
				selfPresence.private.matchMap,
				this.content.maps
			)
		)?.displayName;

		const queueName = getQueueName(selfPresence.private.queueId);

		let details;

		if (gameState === "INGAME") {
			if (queueName) {
				details = `${queueName}`;
			}

			if (details && mapName) {
				details += " " + mapName;
			}

			const score = `${selfPresence.private.partyOwnerMatchScoreAllyTeam}:${selfPresence.private.partyOwnerMatchScoreEnemyTeam}`;
			if (details && score) {
				details += " " + `// ${score}`;
			}
		}

		this.client.setActivity({
			...this.baseActivity,
			details,
			state: gameStateDisplayName[gameState],
			partySize: selfPresence.private.partySize,
			partyMax: selfPresence.private.maxPartySize,
		});
	}
}
