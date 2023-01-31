import { ApiClient } from "../api-client.js";
import { PartyInfo, PartyResponse } from "../types/party.js";

export async function getSelfPartyId(this: ApiClient) {
	const { data: partyRes } = await this.fetch<PartyResponse>(
		"glz",
		`/parties/v1/players/${this.self.puuid}`
	);

	return partyRes.CurrentPartyID;
}

export async function getSelfPartyInfo(this: ApiClient, partyId?: string) {
	const _partyId = partyId ?? (await this.core.getSelfPartyId());
	const { data: partyInfo } = await this.fetch<PartyInfo>(
		"glz",
		`/parties/v1/parties/${_partyId}`
	);

	return partyInfo;
}
