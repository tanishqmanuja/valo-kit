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
import { getInterpolatedColor } from "../utils/helpers/colors.js";

const COLUMN_HEADER = "WR(%)";

export default class PlayerWinRatePlugin
	extends TablePlugin
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	static id = "player-winrate";
	name = "Player WinRate";

	async onStateMenus() {
		const { api, partyInfo, playerMMRs } = this.context;
		const { content } = this.essentialContent;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const partyData = partyInfo as PartyInfo;
		const players = partyData.Members;

		const winrates = players.map(player => {
			const mmr = playerMMRs!.find(mmr => mmr.Subject === player.Subject);
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
		return () => this.table.addColumn(COLUMN_HEADER, winrates);
	}

	async onStatePreGame() {
		const { api, playerMMRs, matchData } = this.context;
		const { content } = this.essentialContent;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;

		const winrates = players.map(player => {
			const mmr = playerMMRs!.find(mmr => mmr.Subject === player.Subject);
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
		return () => this.table.addColumn(COLUMN_HEADER, winrates);
	}

	async onStateInGame() {
		const { api, playerMMRs, matchData } = this.context;
		const { content } = this.essentialContent;

		const currentSeason = api.helpers.getCurrentSeason(content);

		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;

		const winrates = players.map(player => {
			const mmr = playerMMRs!.find(mmr => mmr.Subject === player.Subject);
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
		return () => this.table.addColumn(COLUMN_HEADER, winrates);
	}
}
