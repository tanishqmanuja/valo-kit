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
} from "../table/plugin.js";
import { getInterpolatedColor } from "../utils/helpers/colors.js";

const COLUMN_HEADER = "WR(%)";

export default class PlayerWinRatePlugin
	extends TablePlugin
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	static id = "player-winrate";
	name = "Player WinRate";

	async onStateMenus() {
		const { api, presences, content } = this.table.context;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const players = api.helpers.getMyPartyPlayersPresences(presences);
		const playersNames = api.helpers.getDisplayNamesFromPresences(players);
		const playersUUIDs = api.helpers.getPlayerUUIDs(playersNames);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const winrates = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.puuid);
			const winRateInfo = api.helpers.getCompetitiveWinRateInfo(
				mmr!,
				currentSeason.ID
			);

			const color = getInterpolatedColor(winRateInfo.winRate);

			const winRatePerc = winRateInfo.winRate.toLocaleString("en", {
				style: "percent",
				maximumFractionDigits: 0,
			});

			if (winRateInfo.totalGames === 0) {
				return `${chalk.gray(winRatePerc)} (${winRateInfo.totalGames})`;
			}

			return `${chalk.hex(color)(winRatePerc)} (${winRateInfo.totalGames})`;
		});
		return this.table.addColumn(COLUMN_HEADER, winrates);
	}

	async onStatePreGame() {
		const { api, content, matchData } = this.table.context;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;
		const playersUUIDs = api.helpers.getPlayerUUIDs(players);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const winrates = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.Subject);
			const winRateInfo = api.helpers.getCompetitiveWinRateInfo(
				mmr!,
				currentSeason.ID
			);

			const color = getInterpolatedColor(winRateInfo.winRate);

			const winRatePerc = winRateInfo.winRate.toLocaleString("en", {
				style: "percent",
				maximumFractionDigits: 0,
			});

			if (winRateInfo.totalGames === 0) {
				return `${chalk.gray(winRatePerc)} (${winRateInfo.totalGames})`;
			}

			return `${chalk.hex(color)(winRatePerc)} (${winRateInfo.totalGames})`;
		});
		return this.table.addColumn(COLUMN_HEADER, winrates);
	}

	async onStateInGame() {
		const { api, content, matchData } = this.table.context;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;
		const playersUUIDs = api.helpers.getPlayerUUIDs(players);

		const playersMMR = await api.core.getMMRs(playersUUIDs);

		const winrates = players.map(player => {
			const mmr = playersMMR.find(mmr => mmr.Subject === player.Subject);
			const winRateInfo = api.helpers.getCompetitiveWinRateInfo(
				mmr!,
				currentSeason.ID
			);

			const color = getInterpolatedColor(winRateInfo.winRate);

			const winRatePerc = winRateInfo.winRate.toLocaleString("en", {
				style: "percent",
				maximumFractionDigits: 0,
			});

			if (winRateInfo.totalGames === 0) {
				return `${chalk.gray(winRatePerc)} (${winRateInfo.totalGames})`;
			}

			return `${chalk.hex(color)(winRatePerc)} (${winRateInfo.totalGames})`;
		});
		return this.table.addColumn(COLUMN_HEADER, winrates);
	}
}
