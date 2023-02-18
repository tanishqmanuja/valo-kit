import {
	CoreGameMatchData,
	GameState,
	MMR,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import DiscordRPC, { AutoClient } from "discord-auto-rpc";
import {
	BehaviorSubject,
	filter,
	firstValueFrom,
	merge,
	ReplaySubject,
	retry,
	skipUntil,
	tap,
	timer,
} from "rxjs";
import { getQueueName } from "../formatters/queue.js";
import { Config } from "../helpers/config.js";
import { EssentialContent } from "../helpers/content.js";
import { getModuleLogger } from "../logger/logger.js";
import { ApiService } from "./api.js";
import { PresencesService } from "./presences.js";

export type RPCContext = {
	previousGameState: GameState;
	gameState: GameState;
	essentialContent: EssentialContent;
	playerMMR: MMR;
	matchData?: PreGameMatchData | CoreGameMatchData;
};

const CLIENT_ID = "1070992075128057886";
const FALLBACK_LARGE_IMAGE_KEY = "vry";

const logger = getModuleLogger("Discord RPC Service");

const valTimeParser = (time: string) => {
	const [d, t] = time.split("-");
	return Date.parse(`${d.replace(".", "-")}T${t.replace(".", ":")}`);
};

export class DiscordRPCService {
	private client: DiscordRPC.AutoClient;
	private isReady$ = new BehaviorSubject(false);
	private context$ = new ReplaySubject<RPCContext>(1);

	private baseActivity: DiscordRPC.Presence = {
		largeImageKey: FALLBACK_LARGE_IMAGE_KEY,
		buttons: [
			{
				label: "What's This? 👀",
				url: "https://github.com/tanishqmanuja/valo-kit",
			},
		],
	};

	constructor(
		private config: Config,
		private apiService: ApiService,
		private presencesService: PresencesService
	) {
		this.client = new AutoClient({ transport: "ipc" });

		this.client.once("ready", async () => {
			this.isReady$.next(true);
		});

		if (config.features["discord_rpc"]) {
			this.client.endlessLogin({ clientId: CLIENT_ID });
		}

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

	private get api() {
		return this.apiService.api;
	}

	async updateContext(context: RPCContext) {
		this.context$.next({ ...context });
	}

	async updateActivity() {
		if (!this.config.features["discord_rpc"]) {
			return;
		}

		const activity: DiscordRPC.Presence = {};

		const ctx = await firstValueFrom(this.context$);
		const selfPresence = await this.presencesService.getSelfPresence();

		const gameState = ctx.gameState;
		const content = ctx.essentialContent;

		if (gameState === "MENUS") {
			const currentSeason = this.api.helpers.getCurrentSeason(content.content);
			const latestCompetitiveTiers =
				this.api.external.getLatestCompetitiveTiers(content.competitiveTiers);

			const tier = this.api.helpers.getCompetitiveTier(
				ctx.playerMMR,
				currentSeason
			);
			const rankName = this.api.helpers.getRankName(
				tier.Rank,
				latestCompetitiveTiers
			);

			activity.smallImageText = rankName;
			activity.smallImageKey = `rank_${rankName
				.toLowerCase()
				.replace(/\s/, "")}`;

			activity.largeImageKey = "valorant";
			activity.largeImageText = "Valorant";

			activity.partyId = selfPresence.private.partyId;
			activity.partySize = selfPresence.private.partySize;
			activity.partyMax = selfPresence.private.maxPartySize;
			activity.startTimestamp = new Date(selfPresence.private.partyVersion);

			if (selfPresence.private.partyState === "MATCHMAKING") {
				activity.state = "In Queue";
				activity.state += " " + getQueueName(selfPresence.private.queueId);
				const timeStamp = valTimeParser(selfPresence.private.queueEntryTime);

				if (!isNaN(timeStamp)) {
					activity.startTimestamp = timeStamp;
				}
			} else {
				if (selfPresence.private.partyState === "CUSTOM_GAME_SETUP") {
					activity.details = "Setting Up Custom Game";
				}
				activity.state = "In Lobby";
			}
		}

		if (gameState === "PREGAME") {
			const matchData = ctx.matchData as PreGameMatchData;
			const queueName = getQueueName(selfPresence.private.queueId);
			const modeKey = queueName.toLowerCase().replace(/\s/, "");

			activity.details = queueName;
			activity.largeImageText = queueName;

			const availableIcons = [
				"deathmatch",
				"escalation",
				"replication",
				"snowballfight",
				"spikerush",
				"standard",
				"swiftplay",
			];
			if (selfPresence.private.provisioningFlow !== "INVALID") {
				if (availableIcons.includes(modeKey)) {
					activity.largeImageKey = `mode_${modeKey}`;
				} else {
					activity.largeImageKey = "mode_standard";
				}
			}

			activity.partyId = selfPresence.private.partyId;
			activity.partySize = selfPresence.private.partySize;
			activity.partyMax = selfPresence.private.maxPartySize;
			activity.state = "Agent Select";
			activity.endTimestamp = new Date(
				matchData.Version + matchData.PhaseTimeRemainingNS / 1e6
			);
		}

		if (gameState === "INGAME") {
			const mapName = this.api.external.getMapFromMapUrl(
				selfPresence.private.matchMap,
				content.maps
			)?.displayName;

			if (mapName) {
				activity.largeImageText = mapName;
				activity.largeImageKey = `map_${mapName.toLowerCase()}`;
			}

			const matchData = ctx.matchData as CoreGameMatchData;
			const characterId = matchData.Players.find(
				p => p.Subject === this.api.self.puuid
			)?.CharacterID;
			const agentName = this.api.external.getAgentFromUUID(
				characterId!,
				content.agents
			)?.displayName;

			if (agentName) {
				activity.smallImageText = agentName;
				activity.smallImageKey = `agent_${agentName
					.toLowerCase()
					.replace(/\//, "")}`;
			}

			activity.partyId = selfPresence.private.partyId;
			activity.partySize = selfPresence.private.partySize;
			activity.partyMax = selfPresence.private.maxPartySize;
			activity.state = "In Game";
			activity.details = getQueueName(selfPresence.private.queueId);

			const score = `${selfPresence.private.partyOwnerMatchScoreAllyTeam} - ${selfPresence.private.partyOwnerMatchScoreEnemyTeam}`;
			if (score) {
				activity.details += " " + "//" + " " + score;
			}

			activity.startTimestamp = new Date(matchData.Version);
		}

		try {
			this.client.setActivity({
				...this.baseActivity,
				...activity,
			});
		} catch {}
	}
}
