import {
	CoreGameMatchData,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import { formatRank, RankFormattingStyle } from "../formatters/rank.js";
import type { Table } from "../table/interfaces.js";
import {
	OnStateInGame,
	OnStateMenus,
	OnStatePreGame,
	TablePlugin,
} from "../table/plugin.js";

const COLUMN_HEADER = "Peak Rank";

export default class PlayerPeakRankPlugin
	extends TablePlugin
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	static id = "player-peak-rank";
	name = "Player Peak Rank";

	private logger = this.table.getPluginLogger(this);

	private preferredFormattingStyle: RankFormattingStyle = "full";

	constructor(table: Table, flags?: string[]) {
		super(table, flags);

		if (this.flags.length) {
			const [style] = this.flags;
			if (["full", "short", "tiny"].includes(style.toLowerCase())) {
				this.preferredFormattingStyle =
					style.toLowerCase() as RankFormattingStyle;
			} else {
				this.logger.warn("Invalid prefered style in config");
			}
		}
	}

	async onStateMenus() {
		const { api, presences } = this.table.context;
		const players = api.helpers.getMyPartyPlayersPresences(presences);
		const playersNames = api.helpers.getDisplayNamesFromPresences(players);
		const playersUUIDs = api.helpers.getPlayerUUIDs(playersNames);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const ranks = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.puuid);
			const bestTier = api.helpers.getBestCompetitiveTier(mmr!);
			return this.formatForDisplay(bestTier);
		});
		return this.table.addColumn(COLUMN_HEADER, ranks);
	}

	async onStatePreGame() {
		const { api, matchData } = this.table.context;
		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;
		const playersUUIDs = api.helpers.getPlayerUUIDs(players);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const ranks = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.Subject);
			const bestTier = api.helpers.getBestCompetitiveTier(mmr!);
			return this.formatForDisplay(bestTier);
		});
		return this.table.addColumn(COLUMN_HEADER, ranks);
	}

	async onStateInGame() {
		const { api, matchData } = this.table.context;
		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;
		const playersUUIDs = api.helpers.getPlayerUUIDs(players);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const ranks = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.Subject);
			const bestTier = api.helpers.getBestCompetitiveTier(mmr!);
			return this.formatForDisplay(bestTier);
		});
		return this.table.addColumn(COLUMN_HEADER, ranks);
	}

	private formatForDisplay({
		Rank,
		SeasonID,
	}: {
		Rank?: number;
		SeasonID?: string;
	}) {
		if (!Rank || !SeasonID) {
			return formatRank("Unranked", this.preferredFormattingStyle);
		}

		const { api, competitiveTiers, content } = this.table.context;
		const latestCompetitiveTiers =
			api.external.getLatestCompetitiveTiers(competitiveTiers);

		const { actName, episodeName, episodeId } =
			api.helpers.getEpisodeAndActFromId(SeasonID, content);

		if (!actName || !episodeName || !episodeId) {
			const rank = api.helpers.getRankName(Rank, latestCompetitiveTiers);
			return formatRank(rank, this.preferredFormattingStyle);
		}

		const episodeNum = episodeName.split(" ")[1];
		const actNum = actName.split(" ")[1];

		const episodeCompetitiveTiers = api.external.getCompetitiveTiersForEpisode(
			`Episode${episodeNum}`,
			competitiveTiers
		);

		if (!episodeCompetitiveTiers) {
			const rank = api.helpers.getRankName(Rank, latestCompetitiveTiers);
			return formatRank(rank, this.preferredFormattingStyle);
		}

		const rank = api.helpers.getRankName(Rank, episodeCompetitiveTiers);

		return `${formatRank(
			rank,
			this.preferredFormattingStyle
		)} (E${episodeNum}A${actNum})`;
	}
}
