import { CoreGameMatchData } from "@valo-kit/api-client/types";
import { OnStateInGame, TablePlugin } from "../table/plugin.js";

export default class TeamSpacerPlugin
	extends TablePlugin
	implements OnStateInGame
{
	static id = "team-spacer";
	name = "Team Spacer";

	async onStateInGame() {
		const { api, matchData } = this.table.context;
		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;

		const initialTeam = api.helpers.isInRedTeam(
			players[0].Subject,
			inGameMatchData
		);
		const spaceIndex = players.findIndex(
			p => api.helpers.isInRedTeam(p.Subject, inGameMatchData) !== initialTeam
		);

		if (spaceIndex < 0) {
			return;
		}

		return this.table.addEmptyRow(spaceIndex);
	}
}
