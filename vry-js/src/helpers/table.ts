import { getQueueName } from "../formatters/queue.js";

import type { ApiClient } from "@valo-kit/api-client";
import { colorizeGameState } from "../formatters/gamestate.js";
import { TableContext } from "../table/types/table.js";
import type { EssentialContent } from "./content.js";

export const getTableHeader = async (
	api: ApiClient,
	context: Pick<TableContext, "gameState" | "presences" | "matchData">,
	content: EssentialContent
) => {
	let header = "";

	const { presences, gameState, matchData } = context;
	const { gamepods, maps } = content;
	if (matchData) {
		const server = gamepods[matchData.GamePodID];
		const selfPresence = api.helpers.getSelfPresence(presences);
		const queueName = getQueueName(selfPresence.private.queueId);
		const mapName = api.external.getMapFromMapUrl(
			selfPresence.private.matchMap,
			maps
		)?.displayName ?? api.external.getMapFromMapUrl(
			matchData.MapID,
			maps
		)?.displayName;

		console.log(mapName,queueName,gameState);
		
		if (queueName && mapName && (gameState === "INGAME" || gameState === "PREGAME")) {
			header = `${colorizeGameState(
				gameState
			)} - ${queueName} ${mapName} [${server}]`;
		} else if (
			queueName &&
			selfPresence.private.provisioningFlow !== "INVALID"
		) {
			header = `${colorizeGameState(gameState)} - ${queueName} [${server}]`;
		} else {
			header = `${colorizeGameState(gameState)} - ${server}`;
		}

		if(gameState === "PREGAME" && "AllyTeam" in matchData) {
			header += ` //${matchData.AllyTeam.TeamID === "Blue" ? "Defense" : "Attack"}`;
		}
	} else {
		header = `${colorizeGameState(gameState)}`;
	}
	return header;
};
