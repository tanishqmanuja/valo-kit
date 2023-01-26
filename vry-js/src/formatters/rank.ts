import chalk from "chalk";
import { objectKeys } from "ts-extras";
import type { RGBTuple } from "./types.js";

export const rankColorLUT: Record<string, RGBTuple> = {
	Unranked: [46, 46, 46],
	Iron: [72, 69, 62],
	Bronze: [187, 143, 90],
	Silver: [174, 178, 178],
	Gold: [197, 186, 63],
	Platinum: [24, 167, 185],
	Diamond: [216, 100, 199],
	Ascendant: [24, 148, 82],
	Immortal: [221, 68, 68],
	Radiant: [255, 253, 205],
};

export const colorizeRank = (rank: string) => {
	const rankRoot = rank.split(" ")[0];
	const key = objectKeys(rankColorLUT).find(
		k => k.toLowerCase() === rankRoot.toLowerCase()
	);

	let color: RGBTuple = [180, 180, 180];

	if (key) {
		color = rankColorLUT[key];
	}

	return chalk.rgb(...color)(rank);
};
