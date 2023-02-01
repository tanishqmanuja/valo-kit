import {
	CoreGameMatchData,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import chalk from "chalk";
import { colorizeAgent } from "../formatters/agent.js";
import {
	OnStateInGame,
	OnStatePreGame,
	TablePlugin,
} from "../table/types/plugin.js";

const COLUMN_HEADER = "Agent";

export default class PlayerAgentPlugin
	extends TablePlugin
	implements OnStatePreGame, OnStateInGame
{
	static id = "player-agent";
	name = "Player Agent";
	isEssential = true;

	private logger = this.table.getPluginLogger(this);

	async onStatePreGame() {
		const { api, matchData } = this.context;
		const { agents } = this.essentialContent;

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;

		const agentsList = players.map(player => {
			const agentName = api.external.getAgentFromUUID(
				player.CharacterID,
				agents
			)?.displayName;

			if (player.CharacterSelectionState === "locked") {
				return colorizeAgent(agentName ?? "");
			}

			return chalk.gray(agentName ?? "");
		});
		return () => this.table.addColumn(COLUMN_HEADER, agentsList);
	}

	async onStateInGame() {
		const { api, matchData } = this.context;
		const { agents } = this.essentialContent;

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;

		const agentsList = players.map(player => {
			const agentName = api.external.getAgentFromUUID(
				player.CharacterID,
				agents
			)?.displayName;

			if (!agentName) {
				this.logger.warn(`Agent not found for CID ${player.CharacterID}`);
				return chalk.gray("Unknown Agent");
			}

			return colorizeAgent(agentName);
		});
		return () => this.table.addColumn(COLUMN_HEADER, agentsList);
	}
}
