import type { ApiClient } from "../api-client.js";
import type { PreGameLoadouts, PreGameMatchData } from "../types/pregame.js";

export async function getPreGameMatchId(this: ApiClient, playerUUID?: string) {
	const puuid = playerUUID ?? this.self.puuid!;

	const { data: Match } = await this.fetch<{ MatchID: string }>(
		"glz",
		`/pregame/v1/players/${puuid}`,
		{
			cache: false,
		}
	);
	const { MatchID } = Match ?? {};
	return MatchID;
}

export async function getPreGameMatchData(
	this: ApiClient,
	matchId?: string,
	noCache?: boolean
) {
	const _matchId =
		matchId ?? (await this.core.getPreGameMatchId(this.self.puuid!));

	const { data: MatchInfo } = await this.fetch<PreGameMatchData>(
		"glz",
		`/pregame/v1/matches/${_matchId}`,
		{
			cache: !noCache,
		}
	);

	return MatchInfo;
}

export async function getPreGameLoadouts(this: ApiClient, matchId?: string) {
	const _matchId =
		matchId ?? (await this.core.getPreGameMatchId(this.self.puuid!));

	const { data: MatchLoadouts } = await this.fetch<PreGameLoadouts>(
		"glz",
		`/pregame/v1/matches/${_matchId}/loadouts`
	);
	return MatchLoadouts;
}
