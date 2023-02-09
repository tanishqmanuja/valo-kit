import type { CoreGameMatchData } from "@valo-kit/api-client/types";
import { objectKeys } from "ts-extras";
import type { Command, CommandContext } from "./types.js";

export function InfoCommandHandler(command: Command, context: CommandContext) {
	const regex = /((?<specifier>\w+) )?(?<agent>\w+)/gi;
	const { agent, specifier } = regex.exec(command.paramsRaw)?.groups ?? {};
	let infoAgent = agent?.toLowerCase()?.replace(/\//, "");

	if (!infoAgent) {
		return "Usage !info ?ally|enemy|all agent-name";
	}

	let infoSpecifier = "ally";

	if (specifier?.toLowerCase() === "enemy") {
		infoSpecifier = "enemy";
	}

	if (specifier?.toLowerCase() === "all") {
		infoSpecifier = "all";
	}

	const shortNameMap: Record<string, string> = {
		fnx: "phoenix",
		fenix: "phoenix",
		cyfer: "cypher",
		kj: "killjoy",
	};

	if (objectKeys(shortNameMap).includes(infoAgent)) {
		infoAgent = shortNameMap[infoAgent];
	}

	const { api, essentialContent, gameState, matchData, playerMMRs } = context;
	const { agents, content, competitiveTiers } = essentialContent;

	const agentId = agents.find(
		a => a.displayName.toLowerCase() === infoAgent
	)?.uuid;

	if (!agentId) {
		return "Invalid agent name";
	}

	if (gameState !== "INGAME") {
		return "Command only valid when in-game";
	}

	const inGameMatchData = matchData as CoreGameMatchData;
	const players = inGameMatchData.Players;

	const currentSeason = api.helpers.getCurrentSeason(content);
	const latestCompetitiveTiers =
		api.external.getLatestCompetitiveTiers(competitiveTiers);

	const myTeamId = players.find(p => p.Subject === api.self.puuid)?.TeamID;
	const filteredPlayers = players
		.map((player, index) => {
			const isEnemy = player.TeamID !== myTeamId;
			return {
				isEnemy,
				index,
				...player,
			};
		})
		.filter(p => p.CharacterID === agentId)
		.filter(p => {
			if (infoSpecifier === "all") {
				return true;
			}
			if (infoSpecifier === "ally") {
				return !p.isEnemy;
			}
			if (infoSpecifier === "enemy") {
				return p.isEnemy;
			}
		});

	const data = filteredPlayers.map(player => {
		const agentName = api.external.getAgentFromUUID(
			player.CharacterID,
			agents
		)?.displayName;

		const mmr = playerMMRs!.find(mmr => mmr.Subject === player.Subject);
		const tier = api.helpers.getCompetitiveTier(mmr!, currentSeason);
		const rank = api.helpers.getRankName(tier.Rank, latestCompetitiveTiers);

		const bestTier = api.helpers.getBestCompetitiveTier(mmr!);
		let bestRank = "Unknown";

		try {
			const { actName, episodeName } = api.helpers.getEpisodeAndActFromId(
				bestTier.SeasonID!,
				content
			);

			const episodeNum = episodeName.split(" ")[1];
			const actNum = actName!.split(" ")[1];

			const episodeCompetitiveTiers =
				api.external.getCompetitiveTiersForEpisode(
					`Episode${episodeNum}`,
					competitiveTiers
				);
			const rank = api.helpers.getRankName(
				bestTier.Rank!,
				episodeCompetitiveTiers ?? latestCompetitiveTiers
			);

			bestRank = `${rank} (E${episodeNum}A${actNum})`;
		} catch {}

		const name = player.isEnemy ? "Enemy " + agentName : agentName;

		const level = player.PlayerIdentity.AccountLevel;

		return `${name} - Rank: ${rank} | Peak Rank: ${bestRank} | Lvl: ${level}`;
	});

	if (!(data.length > 0)) {
		return "No data found";
	}

	return data.join(" ♦ ");
}
