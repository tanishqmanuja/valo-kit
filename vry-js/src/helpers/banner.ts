import chalk from "chalk";
import { rawLogger } from "../logger/logger.js";
import { isDevelopment } from "../utils/env.js";
import { version as vr } from "../utils/version.js";

export const setTitle = () => {
	process.title = `VALORANT Rank Yoinker JS v${vr}${
		isDevelopment() ? "-Dev" : ""
	}`;
};

export const logStartingBanner = () => {
	rawLogger.info("");
	rawLogger.info("********************************************************");
	rawLogger.info(`***************** vRY JS v${vr} Started ****************`);

	if (isDevelopment()) {
		rawLogger.info(`********************** DEVELOPMENT *********************`);
	}

	rawLogger.info("********************************************************");
	rawLogger.info("");
};

export const printStartingBanner = () => {
	console.log(
		"⚡️" +
			chalk.yellow(
				`VALORANT Rank Yoinker JS v${vr}${isDevelopment() ? "-Dev" : ""}`
			),
		"\n"
	);
};
