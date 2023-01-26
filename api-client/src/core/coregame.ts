import type { ApiClient } from "../api-client.js";
import type { CoreGameLoadouts, CoreGameMatchData } from "../types/coregame.js";

export async function getCoreGameMatchId(this: ApiClient, playerUUID?: string) {
	const puuid = playerUUID ?? this.self.puuid;

	const { data: Match } = await this.fetch<{ MatchID: string }>(
		"glz",
		`/core-game/v1/players/${puuid}`,
		{
			cache: false,
		}
	);
	const { MatchID } = Match ?? {};
	return MatchID;
}

export async function getCoreGameMatchData(
	this: ApiClient,
	matchId?: string,
	noCache?: boolean
) {
	const _matchId =
		matchId ?? (await this.core.getCoreGameMatchId(this.self.puuid));
	const { data: MatchInfo } = await this.fetch<CoreGameMatchData>(
		"glz",
		`/core-game/v1/matches/${_matchId}`,
		{
			cache: !noCache,
		}
	);

	return MatchInfo;
}

export async function getCoreGameLoadouts(this: ApiClient, matchId?: string) {
	const _matchId =
		matchId ?? (await this.core.getCoreGameMatchId(this.self.puuid));

	const { data: MatchLoadouts } = await this.fetch<CoreGameLoadouts>(
		"glz",
		`/core-game/v1/matches/${_matchId}/loadouts`
	);
	return MatchLoadouts;
}
