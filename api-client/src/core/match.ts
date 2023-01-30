import type { ApiClient } from "../api-client.js";
import type { MatchDetails, MatchHistoryResponse } from "../types/match.js";

export async function getMatchHistory(this: ApiClient, puuid: string) {
	const { data: historyRes } = await this.fetch<MatchHistoryResponse>(
		"pd",
		`/match-history/v1/history/${puuid}`
	);

	return historyRes;
}

export async function getMatchDetails(this: ApiClient, matchId: string) {
	const { data: matchDetails } = await this.fetch<MatchDetails>(
		"pd",
		`/match-details/v1/matches/${matchId}`,
		{
			cache: {
				ttl: Infinity,
			},
		}
	);

	return matchDetails;
}
