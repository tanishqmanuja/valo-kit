import { constants } from "fs";
import { access } from "fs/promises";

export const filesAccessible = async (...files: string[]) => {
	try {
		await Promise.all(files.map(file => access(file, constants.R_OK)));
		return true;
	} catch (e) {
		return false;
	}
};
