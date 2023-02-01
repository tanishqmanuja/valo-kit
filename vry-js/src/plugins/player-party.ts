import {
	CoreGameMatchData,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import chalk from "chalk";
import {
	OnStateInGame,
	OnStatePreGame,
	TablePlugin,
} from "../table/types/plugin.js";

const selfPartySymbol = "●";
const selfPartyIcon = chalk.rgb(221, 224, 41)(selfPartySymbol);
const partySymbol = "■";
const partyIcons = [
	chalk.rgb(227, 67, 67)(partySymbol),
	chalk.rgb(216, 67, 227)(partySymbol),
	chalk.rgb(67, 70, 227)(partySymbol),
	chalk.rgb(67, 227, 208)(partySymbol),
	chalk.rgb(94, 227, 67)(partySymbol),
	chalk.rgb(226, 237, 57)(partySymbol),
	chalk.rgb(212, 82, 207)(partySymbol),
];

const COLUMN_HEADER = "Party";

export default class PlayerPartyPlugin
	extends TablePlugin
	implements OnStatePreGame, OnStateInGame
{
	static id = "player-party";
	name = "Player Party";

	async onStatePreGame() {
		const { api, presences, matchData } = this.context;

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;

		const partiesList = api.helpers.getParties(players, presences);
		const parties = players.map(player => {
			const foundParty = partiesList.find(party =>
				party.players.some(id => id === player.Subject)
			);

			if (!foundParty) {
				return "";
			}

			if (foundParty.players.includes(api.self.puuid)) {
				return selfPartyIcon;
			}

			return partyIcons[foundParty.partyNumber];
		});

		if (parties.some(p => p !== "")) {
			return () => this.table.addColumn(COLUMN_HEADER, parties);
		}
	}

	async onStateInGame() {
		const { api, presences, matchData } = this.context;

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;

		const partiesList = api.helpers.getParties(players, presences);
		const parties = players.map(player => {
			const foundParty = partiesList.find(party =>
				party.players.some(id => id === player.Subject)
			);

			if (!foundParty) {
				return "";
			}

			if (foundParty.players.includes(api.self.puuid)) {
				return selfPartyIcon;
			}

			return partyIcons[foundParty.partyNumber];
		});

		if (parties.some(p => p !== "")) {
			return () => this.table.addColumn(COLUMN_HEADER, parties);
		}
	}
}
