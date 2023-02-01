import {
	CoreGameMatchData,
	PartyInfo,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import {
	OnStateInGame,
	OnStateMenus,
	OnStatePreGame,
	TablePlugin,
} from "../table/types/plugin.js";

const COLUMN_HEADER = "RR";

export default class PlayerRankedRating
	extends TablePlugin
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	static id = "player-rr";
	name = "Player RR";

	async onStateMenus() {
		const { api, partyInfo, playerMMRs } = this.context;
		const { content } = this.essentialContent;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const partyData = partyInfo as PartyInfo;
		const players = partyData.Members;

		const rr = players.map(player => {
			const mmr = playerMMRs!.find(mmr => mmr.Subject === player.Subject);
			const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
			return tier.RankedRating;
		});
		return () => this.table.addColumn(COLUMN_HEADER, rr);
	}

	async onStatePreGame() {
		const { api, playerMMRs, matchData } = this.context;
		const { content } = this.essentialContent;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;

		const rr = players.map(player => {
			const mmr = playerMMRs!.find(mmr => mmr.Subject === player.Subject);
			const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
			return tier.RankedRating;
		});
		return () => this.table.addColumn(COLUMN_HEADER, rr);
	}

	async onStateInGame() {
		const { api, playerMMRs, matchData } = this.context;
		const { content } = this.essentialContent;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;

		const rr = players.map(player => {
			const mmr = playerMMRs!.find(mmr => mmr.Subject === player.Subject);
			const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
			return tier.RankedRating;
		});
		return () => this.table.addColumn(COLUMN_HEADER, rr);
	}
}
