import type { Agent } from "../types/agent.js";
import type { Map } from "../types/map.js";
import { CompetitiveTiers } from "../types/tiers.js";
import type { Weapon } from "../types/weapon.js";
import { externalAxios as fetch } from "../utils/axios.js";

type ValorantApiResponse<T> = {
	status: number;
	data: T;
};

export const getAgents = async () => {
	const {
		data: { data: agents },
	} = await fetch<ValorantApiResponse<Agent[]>>(
		"https://valorant-api.com/v1/agents?isPlayableCharacter=true"
	);
	return agents;
};

export const getAgentFromUUID = (agentUUID: string, agents: Agent[]) => {
	return agents.find(a => a.uuid.toLowerCase() === agentUUID.toLowerCase());
};

export const getGamePods = async () => {
	const {
		data: { data: internal },
	} = await fetch<ValorantApiResponse<Record<string, any>>>(
		"https://valorant-api.com/internal/locres/en-US"
	);
	return internal!.UI_GamePodStrings as Record<string, string>;
};

export const getMaps = async () => {
	const {
		data: { data: maps },
	} = await fetch<ValorantApiResponse<Map[]>>(
		"https://valorant-api.com/v1/maps"
	);
	return maps;
};

export const getMapFromMapUrl = (mapUrl: string, maps: Map[]) => {
	return maps.find(m => m.mapUrl === mapUrl);
};

export const getWeapons = async (): Promise<Weapon[]> => {
	const {
		data: { data: weapons },
	} = await fetch<ValorantApiResponse<Weapon[]>>(
		"https://valorant-api.com/v1/weapons"
	);
	return weapons;
};

export const getCompetitiveTiers = async (): Promise<CompetitiveTiers[]> => {
	const {
		data: { data: tiers },
	} = await fetch<ValorantApiResponse<CompetitiveTiers[]>>(
		"https://valorant-api.com/v1/competitivetiers"
	);
	return tiers;
};

export const getLatestCompetitiveTiers = (
	competitiveTiers: CompetitiveTiers[]
) => {
	const { tiers } = competitiveTiers[competitiveTiers.length - 1] ?? {};
	return tiers;
};

export const getCompetitiveTiersForEpisode = (
	episodeName: string,
	competitiveTiers: CompetitiveTiers[]
) => {
	const { tiers } =
		competitiveTiers.find(ct => ct.assetObjectName.startsWith(episodeName)) ||
		{};
	return tiers;
};
