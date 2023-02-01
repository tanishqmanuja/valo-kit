import {
	CoreGameMatchData,
	PartyInfo,
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
	isEssential = true;

	async onStateMenus() {
		const { partyInfo } = this.context;

		const partyData = partyInfo as PartyInfo;
		const players = partyData.Members;

		const levels = players
			.map(p => p.PlayerIdentity.AccountLevel)
			.map(l => colorizeLevel(l));
		return () => this.table.addColumn(COLUMN_HEADER, levels);
	}

	async onStatePreGame() {
		const { matchData } = this.context;

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;

		const levels = players
			.map(player => player.PlayerIdentity.AccountLevel)
			.map(l => colorizeLevel(l));
		return () => this.table.addColumn(COLUMN_HEADER, levels);
	}

	async onStateInGame() {
		const { matchData } = this.context;

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;

		const levels = players
			.map(player => player.PlayerIdentity.AccountLevel)
			.map(l => colorizeLevel(l));
		return () => this.table.addColumn(COLUMN_HEADER, levels);
	}
}
