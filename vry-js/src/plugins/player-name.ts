import {
	CoreGameMatchData,
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

	async onStateMenus() {
		const { api, presences } = this.table.context;

		const players = api.helpers.getMyPartyPlayersPresences(presences);

		const names = players.map(p => {
			const name = `${p.game_name}#${p.game_tag}`;
			return chalk.rgb(221, 224, 41)(name);
		});
		return () => this.table.addColumn(COLUMN_HEADER, names);
	}

	async onStatePreGame() {
		const { api, presences, matchData } = this.table.context;

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;
		const playersNames = await api.core.getDisplayNamesFromPreGameMatchData(
			preGameMatchData
		);

		const myPartyplayers = api.helpers.getMyPartyPlayersPresences(presences);

		const names = players.map(player => {
			const playerName = playersNames.find(p => p.Subject === player.Subject)!;

			const name = `${playerName.GameName}#${playerName.TagLine}`;

			if (myPartyplayers.some(p => p.puuid === player.Subject)) {
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
		const { api, presences, matchData } = this.table.context;

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;
		const playersNames = await api.core.getDisplayNamesFromCoreGameMatchData(
			inGameMatchData
		);

		const myPartyplayers = api.helpers.getMyPartyPlayersPresences(presences);

		const names = players.map(player => {
			const playerName = playersNames.find(p => p.Subject === player.Subject)!;
			const name = `${playerName.GameName}#${playerName.TagLine}`;
			const isRed = api.helpers.isInRedTeam(player.Subject, inGameMatchData);

			if (myPartyplayers.some(p => p.puuid === player.Subject)) {
				return chalk.rgb(221, 224, 41)(name);
			}

			if (player.PlayerIdentity.Incognito && STREAMER_MODE) {
				return chalk.gray("Hidden");
			}

			if (isRed) {
				return chalk.rgb(238, 77, 77)(name);
			}

			return chalk.rgb(76, 151, 237)(name);
		});

		return () => this.table.addColumn(COLUMN_HEADER, names);
	}
}
