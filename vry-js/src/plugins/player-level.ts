import {
	CoreGameMatchData,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import { colorizeLevel } from "../formatters/level.js";
import {
	OnStateInGame,
	OnStateMenus,
	OnStatePreGame,
	TablePlugin,
} from "../table/types/plugin.js";

const COLUMN_HEADER = "Level";

export default class PlayerLevelPlugin
	extends TablePlugin
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	static id = "player-level";
	name = "Player Level";

	async onStateMenus() {
		const { api, presences } = this.table.context;
		const players = api.helpers.getMyPartyPlayersPresences(presences);
		const levels = players
			.map(p => p.private.accountLevel)
			.map(l => colorizeLevel(l));
		return () => this.table.addColumn(COLUMN_HEADER, levels);
	}

	async onStatePreGame() {
		const { matchData } = this.table.context;
		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;
		const levels = players
			.map(player => player.PlayerIdentity.AccountLevel)
			.map(l => colorizeLevel(l));
		return () => this.table.addColumn(COLUMN_HEADER, levels);
	}

	async onStateInGame() {
		const { matchData } = this.table.context;
		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;
		const levels = players
			.map(player => player.PlayerIdentity.AccountLevel)
			.map(l => colorizeLevel(l));
		return () => this.table.addColumn(COLUMN_HEADER, levels);
	}
}
