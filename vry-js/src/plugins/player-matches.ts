import {
	CoreGameMatchData,
	PreGameMatchData,
} from "@valo-kit/api-client/types";
import chalk from "chalk";
import { formatMatchResult } from "../formatters/match.js";
import {
	OnStateInGame,
	OnStateMenus,
	OnStatePreGame,
	TablePlugin,
} from "../table/types/plugin.js";
import { Table } from "../table/types/table.js";

const COLUMN_HEADER = "Prev Matches";

export default class PlayerMatchesPlugin
	extends TablePlugin
	implements OnStateMenus, OnStatePreGame, OnStateInGame
{
	static id = "player-matches";
	name = "Player Matches";

	private logger = this.table.getPluginLogger(this);

	private numMatches = 2;

	constructor(table: Table, flags?: string[]) {
		super(table, flags);

		if (this.flags.length) {
			const [numFlag] = this.flags;
			const num = parseInt(numFlag);
			if (!isNaN(num)) {
				if (num > 0 && num <= 3) {
					this.numMatches = num;
				} else {
					this.logger.error("Enter num of matches value between 1-3");
				}
			} else {
				this.logger.warn("Error parsing number of matches");
			}
		}
	}

	async onStateMenus() {
		const { api, presences } = this.table.context;
		const players = api.helpers.getMyPartyPlayersPresences(presences);
		const matchesResults = await Promise.all(
			players.map(p => this.getHistory(p.puuid))
		);
		const results = matchesResults.map(it =>
			it.map(r => formatMatchResult(r)).join(chalk.gray(" • "))
		);
		return () => this.table.addColumn(COLUMN_HEADER, results);
	}

	async onStatePreGame() {
		const { matchData } = this.table.context;
		const preGameMatchData = matchData as PreGameMatchData;
		const players = preGameMatchData.AllyTeam.Players;
		const matchesResults = await Promise.all(
			players.map(p => this.getHistory(p.Subject))
		);
		const results = matchesResults.map(it =>
			it.map(r => formatMatchResult(r)).join(chalk.gray(" • "))
		);
		return () => this.table.addColumn(COLUMN_HEADER, results);
	}

	async onStateInGame() {
		const { matchData } = this.table.context;
		const inGameMatchData = matchData as CoreGameMatchData;
		const players = inGameMatchData.Players;
		const matchesResults = await Promise.all(
			players.map(p => this.getHistory(p.Subject))
		);
		const results = matchesResults.map(it =>
			it.map(r => formatMatchResult(r)).join(chalk.gray(" • "))
		);
		return () => this.table.addColumn(COLUMN_HEADER, results);
	}

	private async getHistory(puuid: string) {
		const { api } = this.context;

		const matches = await api.core.getCompetitiveUpdates(puuid, {
			startIndex: 0,
			endIndex: 10,
			queue: "competitive",
		});

		const matchesDetailsRes = await Promise.allSettled(
			matches.Matches.slice(0, this.numMatches)
				.map(m => m.MatchID)
				.map(mid => api.core.getMatchDetails(mid))
		);

		return matchesDetailsRes
			.filter(res => res.status === "fulfilled")
			.map(md => {
				if (md.status === "fulfilled") {
					return api.helpers.getPlayerResultForMatch(md.value, puuid);
				}
			});
	}
}
