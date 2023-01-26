import type { ApiClient } from "../api-client.js";
import type { Presences, RawPresence } from "../types/presence.js";
import { base64ToJSON } from "../utils/helpers/base64.js";

export async function getPresences(this: ApiClient): Promise<Presences> {
	const { data: presencesUnfiltered } = await this.fetch<{
		presences: RawPresence[];
	}>("local", "/chat/v4/presences", {
		cache: false,
	});

	const presencesFiltered = presencesUnfiltered.presences.filter(
		presence => presence.product === "valorant"
	);

	return presencesFiltered.map(presence => {
		return { ...presence, private: base64ToJSON(presence.private) };
	});
}

export async function getSelfPresence(this: ApiClient, presences?: Presences) {
	const _presences = presences ?? (await this.core.getPresences());

	const selfPresence = _presences.find(
		presence => presence.puuid === this.self.puuid
	);

	if (!selfPresence) {
		throw new Error("Self presence not found in presences!");
	}

	return selfPresence;
}

export async function getGameState(this: ApiClient, presences?: Presences) {
	const selfPresence = await this.core.getSelfPresence(presences);
	return selfPresence.private?.sessionLoopState;
}

export async function getMyPartyPlayersPresences(
	this: ApiClient,
	presences?: Presences
) {
	const _presences = presences ?? (await this.core.getPresences());
	const myPartyId = (await this.core.getSelfPresence(_presences)).private
		.partyId;

	return _presences.filter(presence => presence.private.partyId === myPartyId);
}
