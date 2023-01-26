import { ApiClient } from "../api-client.js";
import { PartyInfo, PartyResponse } from "../types/party.js";

export async function getPartyId(this: ApiClient, puuid: string) {
	const { data: partyRes } = await this.fetch<PartyResponse>(
		"glz",
		`/parties/v1/players/${puuid}`
	);

	return partyRes.CurrentPartyID;
}

export async function getPartyIds(this: ApiClient, playerUUIDs: string[]) {
	const ids = await Promise.all(
		playerUUIDs.map(it => this.core.getPartyId(it))
	);
	return ids;
}

export async function getPartyInfo(this: ApiClient, partyId: string) {
	const { data: partyInfo } = await this.fetch<PartyInfo>(
		"glz",
		`/parties/v1/parties/${partyId}`
	);

	return partyInfo;
}
