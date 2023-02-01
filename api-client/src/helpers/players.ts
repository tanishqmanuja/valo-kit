import type { ApiClient } from "../api-client.js";
import type { CoreGameMatchData } from "../types/coregame.js";
import type { PlayerName } from "../types/names.js";
import type { Player } from "../types/player.js";
import type { Presences } from "../types/presence.js";

export function getDisplayNamesFromPresences(
	this: ApiClient,
	presences: Presences
) {
	return presences.map(it => {
		const playerName: PlayerName = {
			Subject: it.puuid,
			DisplayName: it.game_name,
			GameName: it.game_name,
			TagLine: it.game_tag,
		};
		return playerName;
	});
}

export function getPlayerUUIDs(presences: Presences): string[];
export function getPlayerUUIDs(players: Pick<Player, "Subject">[]): string[];
export function getPlayerUUIDs(p: any[]) {
	return p.map(p => p.puuid ?? p.Subject);
}

export function isInBlueTeam(
	playerUUID: string,
	coreGameMatchData: CoreGameMatchData
) {
	const player = coreGameMatchData.Players.find(p => p.Subject === playerUUID);
	return player?.TeamID === "Blue";
}

export function isInRedTeam(
	playerUUID: string,
	coreGameMatchData: CoreGameMatchData
) {
	const player = coreGameMatchData.Players.find(p => p.Subject === playerUUID);
	return player?.TeamID === "Red";
}
