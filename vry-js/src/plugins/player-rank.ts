import {
	CoreGameMatchData,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import { formatRank, RankFormattingStyle } from "../formatters/rank.js";
import {
	OnStateInGame,
	OnStateMenus,
	OnStatePreGame,
	TablePlugin,
} from "../table/types/plugin.js";
import type { Table } from "../table/types/table.js";

const COLUMN_HEADER = "Rank";

export default class PlayerRankPlugin
	extends TablePlugin
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	static id = "player-rank";
	name = "Player Rank";

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
		const { api, presences, content, competitiveTiers } = this.table.context;

		const currentSeason = api.helpers.getCurrentSeason(content);
		const latestCompetitiveTiers =
			api.external.getLatestCompetitiveTiers(competitiveTiers);

		const players = api.helpers.getMyPartyPlayersPresences(presences);
		const playersNames = api.helpers.getDisplayNamesFromPresences(players);
		const playersUUIDs = api.helpers.getPlayerUUIDs(playersNames);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const ranks = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.puuid);
			const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
			const rank = api.helpers.getRankName(tier.Rank, latestCompetitiveTiers);
			return formatRank(rank, this.preferredFormattingStyle);
		});
		return () => this.table.addColumn(COLUMN_HEADER, ranks);
	}

	async onStatePreGame() {
		const { api, content, competitiveTiers, matchData } = this.table.context;

		const currentSeason = api.helpers.getCurrentSeason(content);
		const latestCompetitiveTiers =
			api.external.getLatestCompetitiveTiers(competitiveTiers);

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;
		const playersUUIDs = api.helpers.getPlayerUUIDs(players);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const ranks = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.Subject);
			const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
			const rank = api.helpers.getRankName(tier.Rank, latestCompetitiveTiers);
			return formatRank(rank, this.preferredFormattingStyle);
		});
		return () => this.table.addColumn(COLUMN_HEADER, ranks);
	}

	async onStateInGame() {
		const { api, content, competitiveTiers, matchData } = this.table.context;

		const currentSeason = api.helpers.getCurrentSeason(content);
		const latestCompetitiveTiers =
			api.external.getLatestCompetitiveTiers(competitiveTiers);

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;
		const playersUUIDs = api.helpers.getPlayerUUIDs(players);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const ranks = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.Subject);
			const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
			const rank = api.helpers.getRankName(tier.Rank, latestCompetitiveTiers);
			return formatRank(rank, this.preferredFormattingStyle);
		});
		return () => this.table.addColumn(COLUMN_HEADER, ranks);
	}
}
