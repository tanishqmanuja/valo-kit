import type { ApiClient } from "../api-client.js";
import type { MatchHistoryResponse } from "../types/match.js";

export async function getMatchHistory(this: ApiClient, puuid: string) {
	const { data: historyRes } = await this.fetch<MatchHistoryResponse>(
		"pd",
		`/match-history/v1/history/${puuid}`
	);

	return historyRes;
}
