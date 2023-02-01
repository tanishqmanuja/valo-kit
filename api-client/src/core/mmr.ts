import type { ApiClient } from "../api-client.js";
import type { CompetitiveUpdatesResponse, MMR } from "../types/mmr.js";

export async function getPlayerMMR(
	this: ApiClient,
	playerUUID?: string,
	noCache?: boolean
) {
	const puuid = playerUUID ?? this.self.puuid;

	const { data: MMR } = await this.fetch<MMR>(
		"pd",
		`/mmr/v1/players/${puuid}`,
		{
			cache: !noCache,
		}
	);

	return MMR;
}

export async function getPlayerMMRs(this: ApiClient, playerUUIDs: string[]) {
	const mmrs = await Promise.all(
		playerUUIDs.map(it => this.core.getPlayerMMR(it))
	);
	return mmrs;
}

export async function getCompetitiveUpdates(
	this: ApiClient,
	playerUUID: string,
	params: { startIndex: number; endIndex: number; queue?: string } = {
		startIndex: 0,
		endIndex: 10,
	}
) {
	const { data: compUpdates } = await this.fetch<CompetitiveUpdatesResponse>(
		"pd",
		`/mmr/v1/players/${playerUUID}/competitiveupdates`,
		{
			params,
		}
	);

	return compUpdates;
}
