import chalk from "chalk";
import { rawLogger } from "../logger/logger.js";
import { version as vr } from "../utils/version.js";

export const logStartingBanner = () => {
	rawLogger.info("");
	rawLogger.info("********************************************************");
	rawLogger.info(`***************** vRY JS v${vr} Started ****************`);
	rawLogger.info("********************************************************");
	rawLogger.info("");
};

export const printStartingBanner = () => {
	console.log("⚡️" + chalk.yellow(`VALORANT Rank Yoinker JS v${vr}`), "\n");
};
