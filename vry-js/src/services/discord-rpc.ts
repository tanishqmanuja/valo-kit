import { ApiClient } from "@valo-kit/api-client";
import { GameState } from "@valo-kit/api-client/types";
import DiscordRPC from "discord-rpc";
import { BehaviorSubject, filter, firstValueFrom } from "rxjs";
import { getQueueName } from "../formatters/queue.js";
import { EssentialContent } from "../helpers/content.js";
import { PresencesService } from "./presences.js";

const CLIENT_ID = "1070992075128057886";

export class DiscordRPCService {
	private client: DiscordRPC.Client;
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
		this.client = new DiscordRPC.Client({ transport: "ipc" });

		this.client.on("ready", async () => {
			this.isReady$.next(true);
		});

		this.client.login({ clientId: CLIENT_ID });
	}

	async updateActivity() {
		await firstValueFrom(this.isReady$.pipe(filter(Boolean)));

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
