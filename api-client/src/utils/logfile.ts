import { readFile } from "node:fs/promises";
import { LOG_FILE_PATH } from "./constants.js";

export type LogFileInfo = {
	version: string;
	glzServer: string;
	pdServer: string;
	sharedServer: string;
};

export const parseLogFile = async (
	logfilePath?: string
): Promise<LogFileInfo> => {
	const filePath = logfilePath || LOG_FILE_PATH;

	try {
		const LogFileRaw = await readFile(filePath, "utf-8");
		const LogFileLines = LogFileRaw.split(/\r?\n/);

		const versionLine = LogFileLines.find(line =>
			line.includes("CI server version:")
		);
		const versionTempLine = versionLine
			?.split("CI server version: ")?.[1]
			?.trim()
			.split("-");
		const version = `${versionTempLine?.[0]}-${versionTempLine?.[1]}-shipping-${versionTempLine?.[2]}-${versionTempLine?.[3]}`;

		const glzServerLine = LogFileLines.find(
			line => line.includes("https://glz-") && line.includes(".a.pvp.net/")
		);
		const glzServer = glzServerLine?.match(
			/https:\/\/glz-.*?\.a\.pvp\.net/
		)?.[0];

		const pdServerLine = LogFileLines.find(
			line => line.includes("https://pd.") && line.includes(".a.pvp.net/")
		);
		const pdServer = pdServerLine?.match(/https:\/\/pd\..*?\.a\.pvp\.net/)?.[0];

		const sharedServerLine = LogFileLines.find(
			line => line.includes("https://shared.") && line.includes(".a.pvp.net/")
		);
		const sharedServer = sharedServerLine?.match(
			/https:\/\/shared\..*?\.a\.pvp\.net/
		)?.[0];

		if (!(glzServer && pdServer && sharedServer)) {
			throw new Error(`LogFile server data missing`);
		}

		return { version, glzServer, pdServer, sharedServer };
	} catch (e) {
		throw new Error(`LogFile doesn't exist at ${filePath}`);
	}
};
