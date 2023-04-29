import type { LooseAutoComplete } from "@valo-kit/api-client/types";
import chalk from "chalk";

export const formatMatchResult = (matchResult?: LooseAutoComplete<"Win" | "Loss" | "Draw">) => {
	if (matchResult === "Win") {
		return chalk.green("W");
	} else if (matchResult === "Loss") {
		return chalk.red("L");
	} else if (matchResult === "Draw") {
		return chalk.yellow("D");
	} else {
		return chalk.gray("-");
	}
};
