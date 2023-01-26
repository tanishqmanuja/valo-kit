import chalk from "chalk";
import { objectKeys } from "ts-extras";
import type { RGBTuple } from "./types.js";

export const agentColorLUT: Record<string, RGBTuple> = {
	Neon: [28, 69, 161],
	Viper: [48, 186, 135],
	Yoru: [52, 76, 207],
	Astra: [113, 42, 232],
	Breach: [217, 122, 46],
	Brimstone: [217, 122, 46],
	Cypher: [245, 240, 230],
	Jett: [154, 222, 255],
	"KAY/O": [133, 146, 156],
	Killjoy: [255, 217, 31],
	Omen: [71, 80, 143],
	Phoenix: [254, 130, 102],
	Raze: [217, 122, 46],
	Reyna: [181, 101, 181],
	Sage: [90, 230, 213],
	Skye: [192, 230, 158],
	Sova: [37, 143, 204],
	Chamber: [200, 200, 200],
	Fade: [92, 92, 94],
	Harbor: [16, 200, 205],
};

export const colorizeAgent = (agent: string) => {
	const key = objectKeys(agentColorLUT).find(
		k => k.toLowerCase() === agent.toLowerCase()
	);

	let color: RGBTuple = [100, 100, 100];

	if (key) {
		color = agentColorLUT[key];
	}

	return chalk.rgb(...color)(agent);
};
