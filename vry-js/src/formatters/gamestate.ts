import type { GameState } from "@valo-kit/api-client/types";
import chalk from "chalk";

export const colorizeGameState = (state: GameState) => {
	if (state === "MENUS") {
		return chalk.rgb(238, 241, 54)("In-Menus");
	} else if (state === "PREGAME") {
		return chalk.rgb(103, 237, 76)("Agent Select");
	} else {
		return chalk.rgb(241, 39, 39)("In-Game");
	}
};
