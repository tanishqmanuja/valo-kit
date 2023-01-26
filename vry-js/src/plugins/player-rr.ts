import {
	CoreGameMatchData,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import {
	OnStateInGame,
	OnStateMenus,
	OnStatePreGame,
	TablePlugin,
} from "../table/plugin.js";

const COLUMN_HEADER = "RR";

export default class PlayerRankedRating
	extends TablePlugin
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	static id = "player-rr";
	name = "Player RR";

	async onStateMenus() {
		const { api, content, presences } = this.table.context;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const players = api.helpers.getMyPartyPlayersPresences(presences);
		const playersNames = api.helpers.getDisplayNamesFromPresences(players);
		const playersUUIDs = api.helpers.getPlayerUUIDs(playersNames);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const rr = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.puuid);
			const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
			return tier.RankedRating;
		});
		return this.table.addColumn(COLUMN_HEADER, rr);
	}

	async onStatePreGame() {
		const { api, content, matchData } = this.table.context;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;
		const playersUUIDs = api.helpers.getPlayerUUIDs(players);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const rr = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.Subject);
			const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
			return tier.RankedRating;
		});
		return this.table.addColumn(COLUMN_HEADER, rr);
	}

	async onStateInGame() {
		const { api, content, matchData } = this.table.context;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;
		const playersUUIDs = api.helpers.getPlayerUUIDs(players);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const rr = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.Subject);
			const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
			return tier.RankedRating;
		});
		return this.table.addColumn(COLUMN_HEADER, rr);
	}
}
