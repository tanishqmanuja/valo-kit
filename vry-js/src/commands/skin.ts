import type {
	CoreGameLoadouts,
	CoreGameMatchData,
} from "@valo-kit/api-client/types";
import {
	getMappedLoadout,
	WeaponName,
	weaponsList,
} from "../formatters/loadouts.js";
import { capitalizeFirstLetter } from "../utils/helpers/text.js";
import type { Command, CommandContext } from "./types.js";

export function skinCommandHandler(command: Command, context: CommandContext) {
	const preferredWeapon = command.params[0]?.toLowerCase() as WeaponName;

	if (!weaponsList.includes(preferredWeapon)) {
		return;
	}

	const { api, agents, gameState, matchData, matchLoadouts, weapons } = context;
	const inGameLoadouts = matchLoadouts as CoreGameLoadouts;

	if (gameState !== "INGAME") {
		return;
	}

	const inGameMatchData = matchData as CoreGameMatchData;
	const players = inGameMatchData.Players;
	const myTeamId = players.find(p => p.Subject === api.self.puuid)?.TeamID;
	const agentsList = players.map(player => {
		const agentName = api.external.getAgentFromUUID(
			player.CharacterID,
			agents
		)?.displayName;

		const teamName = player.TeamID === myTeamId ? "" : "Enemy";

		return `${teamName}${agentName ?? "Unknown Agent"}`;
	});

	const skinsList = inGameLoadouts?.Loadouts.map(l =>
		getMappedLoadout(l.Loadout, weapons)
	).map(loudout => {
		const skin = loudout[preferredWeapon].skin;
		const regex = new RegExp(preferredWeapon, "ig");
		const name = skin.displayName.replace(regex, "").trim();
		return name;
	});

	let res = capitalizeFirstLetter(preferredWeapon) + " ♦ ";
	skinsList.forEach((skin, index) => {
		if (skin.toLowerCase() !== "standard") {
			res += `${agentsList[index]} - ${skin}` + " ♦ ";
		}
	});

	return res;
}