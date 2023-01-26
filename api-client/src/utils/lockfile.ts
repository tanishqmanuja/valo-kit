import { readFile } from "node:fs/promises";
import { LOCK_FILE_PATH } from "./constants.js";

export type LockFileInfo = {
	raw: string;
	client: string;
	pid: string;
	port: string;
	password: string;
	protocol: string;
};

export const parseLockFile = async (
	lockfilePath?: string
): Promise<LockFileInfo> => {
	const filePath = lockfilePath || LOCK_FILE_PATH;

	try {
		const raw = await readFile(filePath, { encoding: "utf-8" });
		const matches = raw.match(/(.*):(.*):(.*):(.*):(.*)/);
		const client = matches?.[1]!;
		const pid = matches?.[2]!;
		const port = matches?.[3]!;
		const password = matches?.[4]!;
		const protocol = matches?.[5]!;

		return {
			raw,
			client,
			pid,
			port,
			password,
			protocol,
		};
	} catch (e) {
		throw new Error(`LockFile doesn't exist at ${filePath}`);
	}
};
