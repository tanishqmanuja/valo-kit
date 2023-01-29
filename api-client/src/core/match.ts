import type { ApiClient } from "../api-client.js";
import type {
	MatchDetailsResponse,
	MatchHistoryResponse,
} from "../types/match.js";

export async function getMatchHistory(this: ApiClient, puuid: string) {
	const { data: historyRes } = await this.fetch<MatchHistoryResponse>(
		"pd",
		`/match-history/v1/history/${puuid}`
	);

	return historyRes;
}

export async function getMatchDetails(this: ApiClient, matchId: string) {
	const { data: matchDetails } = await this.fetch<MatchDetailsResponse>(
		"pd",
		`/match-details/v1/matches/${matchId}`
	);

	return matchDetails;
}
