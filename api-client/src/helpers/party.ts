import type { ApiClient } from "../api-client.js";
import type { MappedParty } from "../types/party.js";
import type { Player } from "../types/player.js";
import type { Presence, Presences } from "../types/presence.js";

export function getParties(
	players: Pick<Player, "Subject">[],
	presences: Presence[]
) {
	const partyPlayersPresences =
		players
			.filter(
				player =>
					(presences.find(presence => presence.puuid === player.Subject)
						?.private.partySize ?? 0) >= 2
			)
			.map(player =>
				presences.find(presence => presence.puuid === player.Subject)
			) ?? [];

	const parties = partyPlayersPresences.reduce(
		(parties: MappedParty[], player) => {
			const foundParty = parties.find(
				party => party.partyId === player?.private.partyId
			);
			if (foundParty) {
				foundParty.players.push(player?.puuid!);
			} else {
				parties.push({
					partyNumber: parties.length + 1,
					partyId: player?.private.partyId!,
					players: [player?.puuid!],
				});
			}
			return parties;
		},
		[]
	);

	return parties;
}

export function isPlayerInMyParty(
	this: ApiClient,
	playerUUID: string,
	presences: Presences
) {
	const myPartyplayers = this.helpers.getMyPartyPlayersPresences(presences);
	return myPartyplayers.some(p => p.puuid === playerUUID);
}
