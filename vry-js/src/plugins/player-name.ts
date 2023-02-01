import {
	CoreGameMatchData,
	PartyInfo,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import chalk from "chalk";
import {
	OnStateInGame,
	OnStateMenus,
	OnStatePreGame,
	TablePlugin,
} from "../table/types/plugin.js";
import { isStreamerModeEnabled } from "../utils/env.js";

const COLUMN_HEADER = "Name";
const STREAMER_MODE = isStreamerModeEnabled();

export default class PlayerNamePlugin
	extends TablePlugin
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	static id = "player-name";
	name = "Player Name";
	isEssential = true;

	async onStateMenus() {
		const { partyInfo, playerNames } = this.table.context;

		const partyData = partyInfo as PartyInfo;
		const players = partyData.Members;

		const names = players.map(player => {
			const playerName = playerNames!.find(p => p.Subject === player.Subject)!;
			const name = `${playerName.GameName}#${playerName.TagLine}`;
			return chalk.rgb(221, 224, 41)(name);
		});
		return () => this.table.addColumn(COLUMN_HEADER, names);
	}

	async onStatePreGame() {
		const { api, presences, playerNames, matchData } = this.context;

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;

		const names = players.map(player => {
			const playerName = playerNames!.find(p => p.Subject === player.Subject)!;

			const name = `${playerName.GameName}#${playerName.TagLine}`;

			if (api.helpers.isPlayerInMyParty(player.Subject, presences)) {
				return chalk.rgb(221, 224, 41)(name);
			}

			if (player.PlayerIdentity.Incognito && STREAMER_MODE) {
				return chalk.gray("Hidden");
			}

			return chalk.rgb(76, 151, 237)(name);
		});

		return () => this.table.addColumn(COLUMN_HEADER, names);
	}

	async onStateInGame() {
		const { api, presences, playerNames, matchData } = this.context;

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;

		const names = players.map(player => {
			const playerName = playerNames!.find(p => p.Subject === player.Subject)!;
			const name = `${playerName.GameName}#${playerName.TagLine}`;

			if (api.helpers.isPlayerInMyParty(player.Subject, presences)) {
				return chalk.rgb(221, 224, 41)(name);
			}

			if (player.PlayerIdentity.Incognito && STREAMER_MODE) {
				return chalk.gray("Hidden");
			}

			if (api.helpers.isInRedTeam(player.Subject, inGameMatchData)) {
				return chalk.rgb(238, 77, 77)(name);
			}

			return chalk.rgb(76, 151, 237)(name);
		});

		return () => this.table.addColumn(COLUMN_HEADER, names);
	}
}
