import type { ApiClient } from "../api-client.js";
import type { Presence, Presences, RawPresence } from "../types/presence.js";
import { base64ToJSON } from "../utils/helpers/base64.js";

export function getPresenceFor(
	this: ApiClient,
	presences: Presences,
	playerUUID: string
) {
	const foundPresence = presences.find(
		presence => presence.puuid === playerUUID
	);

	if (!foundPresence) {
		throw new Error(
			`PlayerUUID: ${playerUUID} not in given presences ${JSON.stringify(
				presences
			)}!`
		);
	}

	return foundPresence;
}

export function getSelfPresence(this: ApiClient, presences: Presences) {
	const selfPresence = presences.find(
		presence => presence.puuid === this.self.puuid
	);

	if (!selfPresence) {
		throw new Error("Self presence not found in presences!");
	}

	return selfPresence;
}

export function getGameState(this: ApiClient, presences: Presence[]) {
	const selfPresence = this.helpers.getSelfPresence(presences);
	return selfPresence.private.sessionLoopState;
}

export function parseRawPresences(rawPresences: RawPresence[]): Presences {
	const presencesFiltered = rawPresences.filter(
		presence => presence.product === "valorant"
	);

	return presencesFiltered.map(presence => {
		return { ...presence, private: base64ToJSON(presence.private) };
	});
}

export function getMyPartyPlayersPresences(
	this: ApiClient,
	presences: Presences
) {
	const myPartyId = this.helpers.getSelfPresence(presences).private.partyId;

	return presences
		.filter(presence => presence.private.partyId === myPartyId)
		.filter(
			(presence, index, self) =>
				index === self.findIndex(p => p.puuid === presence.puuid)
		);
}

export function mergePresences(...presenceses: Presences[]) {
	return presenceses.reduce(
		(mergedPresences, newPresences) => [
			...mergedPresences.filter(
				pOld => !newPresences.find(pNew => pNew.puuid === pOld.puuid)
			),
			...newPresences,
			...mergedPresences.filter(pOld =>
				newPresences.find(
					pNew => pNew.puuid === pOld.puuid && pNew.time < pOld.time
				)
			),
		],
		[]
	);
}
