import chalk from "chalk";
import { objectKeys } from "ts-extras";
import type { RGBTuple } from "./types.js";

export type RankFormattingStyle = "full" | "short" | "tiny";

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

export const shortRankReplacementMap: Record<string, string> = {
	Unranked: "URnk",
	Iron: "Iron",
	Bronze: "Brnz",
	Silver: "Slvr",
	Gold: "Gold",
	Platinum: "Plat",
	Diamond: "Dmnd",
	Ascendant: "Ascd",
	Immortal: "Immo",
	Radiant: "Rdnt",
};

export const tinyRankReplacementMap: Record<string, string> = {
	Unranked: "UR",
	Iron: "I",
	Bronze: "B",
	Silver: "S",
	Gold: "G",
	Platinum: "P",
	Diamond: "D",
	Ascendant: "A",
	Immortal: "IM",
	Radiant: "RDN",
};

export const formatRank = (
	rank: string,
	style: RankFormattingStyle = "full"
) => {
	const rankRoot = rank.split(" ")[0];
	const key = objectKeys(rankColorLUT).find(
		k => k.toLowerCase() === rankRoot.toLowerCase()
	);

	let color: RGBTuple = [180, 180, 180];

	if (key) {
		color = rankColorLUT[key];
	}

	if (style === "tiny") {
		const tinyRank = rank
			.replace(rankRoot, tinyRankReplacementMap[rankRoot])
			.replace(/\s/g, "");
		return chalk.rgb(...color)(tinyRank);
	}

	if (style === "short") {
		const shortRank = rank.replace(rankRoot, shortRankReplacementMap[rankRoot]);
		return chalk.rgb(...color)(shortRank);
	}

	return chalk.rgb(...color)(rank);
};
