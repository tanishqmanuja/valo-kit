import type { ApiClient } from "@valo-kit/api-client";
import { oraPromise } from "ora";

import type {
	Agent,
	CompetitiveTiers,
	Map,
	Weapon,
} from "@valo-kit/api-client/types";
import chalk from "chalk";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

const file = join(cwd(), "./.cache/content.json");

try {
	mkdirSync("./.cache", { recursive: true });
} catch {}

const adapter = new JSONFile<{
	clientVersion: string;
	competitiveTiers: CompetitiveTiers[];
	agents: Agent[];
	weapons: Weapon[];
	maps: Map[];
}>(file);

const db = new Low(adapter);

export type EssentialContent = Awaited<
	ReturnType<typeof fetchEssentialContent>
>;

export const fetchEssentialContent = async (api: ApiClient) => {
	const [content, cachedContent, gamepods] = await oraPromise(
		Promise.all([
			api.core.getContent(),
			fetchCachedContent(api),
			api.external.getGamePods(),
		]),
		{
			text: "Fetching essential content...",
			successText: res =>
				`Essential content fetched ${
					res[1].cached ? chalk.gray("[Cache]") : ""
				}`,
			failText: "Unable to fetch content.",
		}
	);

	const { competitiveTiers, agents, weapons, maps } = cachedContent;
	return {
		content,
		competitiveTiers,
		agents,
		weapons,
		maps,
		gamepods,
	};
};

const fetchCachedContent = async (api: ApiClient) => {
	await db.read();

	let cached = true;
	const clientVersion = api.getClientInfo().version!;

	if (!db.data || db.data.clientVersion !== clientVersion) {
		const [competitiveTiers, agents, weapons, maps] = await Promise.all([
			api.external.getCompetitiveTiers(),
			api.external.getAgents(),
			api.external.getWeapons(),
			api.external.getMaps(),
		]);

		db.data = {
			clientVersion,
			competitiveTiers,
			agents,
			maps,
			weapons,
		};

		await db.write();
		cached = false;
	}

	return { ...db.data, cached };
};
