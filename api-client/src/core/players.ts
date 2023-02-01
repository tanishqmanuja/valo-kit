import type { ApiClient } from "../api-client.js";
import type { CoreGameMatchData } from "../types/coregame.js";
import type { PlayerName } from "../types/names.js";
import type { PreGameMatchData } from "../types/pregame.js";
import type { Presences } from "../types/presence.js";
import { UserInfo, UserInfoResponse } from "../types/userinfo.js";

export async function getPlayerNames(this: ApiClient, playerUUIDs: string[]) {
	const { data: playerNames } = await this.fetch<PlayerName[]>(
		"pd",
		`/name-service/v2/players`,
		{
			method: "PUT",
			data: JSON.stringify(playerUUIDs),
			cache: true,
		}
	);

	return playerNames;
}

export async function getDisplayNamesFromPresences(
	this: ApiClient,
	presences?: Presences
) {
	const _presences = presences ?? (await this.core.getPresences());
	return this.helpers.getDisplayNamesFromPresences(_presences);
}

export async function getDisplayNamesFromPreGameMatchData(
	this: ApiClient,
	preGameMatchData?: PreGameMatchData
) {
	const _preGameMatchData =
		preGameMatchData || (await this.core.getPreGameMatchData());

	const playerUUIDs = _preGameMatchData.AllyTeam.Players.map(p => p.Subject);
	const displayNames = await this.core.getPlayerNames(playerUUIDs);
	return displayNames;
}

export async function getDisplayNamesFromCoreGameMatchData(
	this: ApiClient,
	coreGameMatchData?: CoreGameMatchData
) {
	const _coreGameMatchData =
		coreGameMatchData || (await this.core.getCoreGameMatchData());

	const playerUUIDs = _coreGameMatchData.Players.map(p => p.Subject);
	const displayNames = await this.core.getPlayerNames(playerUUIDs);
	return displayNames;
}

export async function getUserInfo(this: ApiClient) {
	const { data: userInfoRes } = await this.fetch<UserInfoResponse>(
		"local",
		"/rso-auth/v1/authorization/userinfo"
	);

	const userInfo: UserInfo = JSON.parse(userInfoRes.userInfo);
	return userInfo;
}
